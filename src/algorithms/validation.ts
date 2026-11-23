import type { SystemState, ValidationIssue, ValidationResult, ValidationScope } from '../types/simulator';

export function isValidNonNegativeInt(value: number): boolean {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function computeTotalAllocated(allocation: number[][], resourceCount: number): number[] {
  const safeResourceCount = Math.max(0, Math.floor(resourceCount));
  const totals = Array.from({ length: safeResourceCount }, () => 0);
  if (!Array.isArray(allocation)) return totals;

  for (let i = 0; i < allocation.length; i++) {
    const row = allocation[i];
    if (!Array.isArray(row)) continue;
    for (let j = 0; j < safeResourceCount; j++) {
      const val = row[j];
      totals[j] += typeof val === 'number' && Number.isFinite(val) ? val : 0;
    }
  }
  return totals;
}

export function computeNeedMatrix(maximum: number[][], allocation: number[][]): number[][] {
  if (!Array.isArray(maximum)) return [];
  return maximum.map((maxRow, i) => {
    if (!Array.isArray(maxRow)) return [];
    const allocRow = Array.isArray(allocation?.[i]) ? allocation[i] : [];
    return maxRow.map((maxVal, j) => {
      const aVal = allocRow[j] ?? 0;
      return maxVal - aVal;
    });
  });
}

function checkMatrixDimensions(
  matrix: number[][],
  expectedRows: number,
  expectedCols: number,
  matrixLabel: string,
  idPrefix: string,
  issues: ValidationIssue[]
): boolean {
  if (!Array.isArray(matrix) || matrix.length !== expectedRows) {
    issues.push({
      id: `dim-${idPrefix}-rows`,
      field: 'dimensions',
      message: `${matrixLabel} matrix must have exactly ${expectedRows} row(s) matching the process count.`,
    });
    return false;
  }

  let validCols = true;
  for (let i = 0; i < expectedRows; i++) {
    if (!Array.isArray(matrix[i]) || matrix[i].length !== expectedCols) {
      issues.push({
        id: `dim-${idPrefix}-cols-${i}`,
        field: 'dimensions',
        processIndex: i,
        message: `${matrixLabel} row ${i} must have exactly ${expectedCols} column(s) matching the resource count.`,
      });
      validCols = false;
    }
  }
  return validCols;
}

export function validateSystemState(
  state: SystemState,
  scope: ValidationScope = 'all'
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!state || !Array.isArray(state.processNames) || !Array.isArray(state.resourceNames)) {
    return {
      valid: false,
      issues: [
        {
          id: 'dim-invalid-state',
          field: 'dimensions',
          message: 'System state must define processNames and resourceNames arrays.',
        },
      ],
    };
  }

  const pCount = state.processNames.length;
  const rCount = state.resourceNames.length;

  if (pCount < 1) {
    issues.push({
      id: 'dim-process',
      field: 'dimensions',
      message: 'At least one process is required to run the simulation.',
    });
  }
  if (rCount < 1) {
    issues.push({
      id: 'dim-resource',
      field: 'dimensions',
      message: 'At least one resource type is required to run the simulation.',
    });
  }

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  // Validate vector and matrix dimensions
  if (!Array.isArray(state.available) || state.available.length !== rCount) {
    issues.push({
      id: 'dim-available',
      field: 'dimensions',
      message: `Available vector must have exactly ${rCount} entry(ies) matching the resource count.`,
    });
  }

  if (!Array.isArray(state.totalCapacity) || state.totalCapacity.length !== rCount) {
    issues.push({
      id: 'dim-capacity',
      field: 'dimensions',
      message: `Total capacity vector must have exactly ${rCount} entry(ies) matching the resource count.`,
    });
  }

  const allocDimOk = checkMatrixDimensions(
    state.allocation,
    pCount,
    rCount,
    'Allocation',
    'alloc',
    issues
  );

  const maxDimOk =
    scope === 'bankers' || scope === 'all'
      ? checkMatrixDimensions(state.maximum, pCount, rCount, 'Maximum', 'max', issues)
      : true;

  const reqDimOk =
    scope === 'deadlock' || scope === 'all'
      ? checkMatrixDimensions(state.request, pCount, rCount, 'Request', 'req', issues)
      : true;

  if (issues.length > 0 || !allocDimOk || !maxDimOk || !reqDimOk) {
    return { valid: false, issues };
  }

  // Validate Available vector
  for (let j = 0; j < rCount; j++) {
    const val = state.available[j];
    const rName = state.resourceNames[j] || `R${j}`;
    if (!isValidNonNegativeInt(val)) {
      issues.push({
        id: `avail-${j}`,
        field: 'available',
        resourceIndex: j,
        message: `Available value for resource ${rName} must be a non-negative safe integer.`,
      });
    }
  }

  // Validate Allocation matrix
  for (let i = 0; i < pCount; i++) {
    const pName = state.processNames[i] || `P${i}`;
    for (let j = 0; j < rCount; j++) {
      const rName = state.resourceNames[j] || `R${j}`;
      const alloc = state.allocation[i]?.[j];
      if (!isValidNonNegativeInt(alloc)) {
        issues.push({
          id: `alloc-${i}-${j}`,
          field: 'allocation',
          processIndex: i,
          resourceIndex: j,
          message: `Allocation[${pName}][${rName}] must be a non-negative safe integer.`,
        });
      }
    }
  }

  // Validate Maximum matrix and Allocation <= Maximum for Banker's or All
  if (scope === 'bankers' || scope === 'all') {
    for (let i = 0; i < pCount; i++) {
      const pName = state.processNames[i] || `P${i}`;
      for (let j = 0; j < rCount; j++) {
        const rName = state.resourceNames[j] || `R${j}`;
        const maxVal = state.maximum[i]?.[j];
        const alloc = state.allocation[i]?.[j];
        if (!isValidNonNegativeInt(maxVal)) {
          issues.push({
            id: `max-${i}-${j}`,
            field: 'maximum',
            processIndex: i,
            resourceIndex: j,
            message: `Maximum[${pName}][${rName}] must be a non-negative safe integer.`,
          });
        } else if (isValidNonNegativeInt(alloc) && alloc > maxVal) {
          issues.push({
            id: `alloc-gt-max-${i}-${j}`,
            field: 'allocation',
            processIndex: i,
            resourceIndex: j,
            message: `${pName} allocation for ${rName} (${alloc}) exceeds its maximum claim (${maxVal}).`,
          });
        }
      }
    }
  }

  // Validate Request matrix for Deadlock Detection or All
  if (scope === 'deadlock' || scope === 'all') {
    for (let i = 0; i < pCount; i++) {
      const pName = state.processNames[i] || `P${i}`;
      for (let j = 0; j < rCount; j++) {
        const rName = state.resourceNames[j] || `R${j}`;
        const reqVal = state.request[i]?.[j];
        if (!isValidNonNegativeInt(reqVal)) {
          issues.push({
            id: `req-${i}-${j}`,
            field: 'request',
            processIndex: i,
            resourceIndex: j,
            message: `Request[${pName}][${rName}] must be a non-negative safe integer.`,
          });
        }
      }
    }
  }

  // Validate Total Capacity >= Total Allocated and safe integer arithmetic sums
  const totalAllocated = computeTotalAllocated(state.allocation, rCount);
  for (let j = 0; j < rCount; j++) {
    const rName = state.resourceNames[j] || `R${j}`;
    const cap = state.totalCapacity[j];
    const avail = state.available[j];

    if (!Number.isSafeInteger(totalAllocated[j])) {
      issues.push({
        id: `alloc-overflow-${j}`,
        field: 'allocation',
        resourceIndex: j,
        message: `Total allocated for ${rName} exceeds JavaScript safe integer precision.`,
      });
    } else if (isValidNonNegativeInt(avail) && !Number.isSafeInteger(totalAllocated[j] + avail)) {
      issues.push({
        id: `work-overflow-${j}`,
        field: 'available',
        resourceIndex: j,
        message: `Combined Allocated + Available for ${rName} exceeds safe integer precision.`,
      });
    }

    if (!isValidNonNegativeInt(cap)) {
      issues.push({
        id: `cap-invalid-${j}`,
        field: 'capacity',
        resourceIndex: j,
        message: `Total capacity for resource ${rName} must be a non-negative safe integer.`,
      });
    } else if (Number.isSafeInteger(totalAllocated[j]) && totalAllocated[j] > cap) {
      issues.push({
        id: `cap-exceeded-${j}`,
        field: 'capacity',
        resourceIndex: j,
        message: `Total allocated for ${rName} (${totalAllocated[j]}) exceeds system capacity (${cap}).`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
