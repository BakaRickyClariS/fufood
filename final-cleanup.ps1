# ==========================================
# Final Architecture Cleanup Script
# ==========================================
# This script will complete the remaining 15% of refactoring:
# 1. Move hooks to shared/hooks
# 2. Move types to shared/types
# 3. Move utils to shared/utils
# 4. Reorganize store slices
# ==========================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Final Architecture Cleanup - Complete to 100%" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set project root
$projectRoot = $PSScriptRoot
Set-Location $projectRoot

Write-Host "Project directory: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Show what will be done
Write-Host "This script will move the following:" -ForegroundColor Yellow
Write-Host "  1. src/hooks/*.ts -> shared/hooks/" -ForegroundColor White
Write-Host "  2. src/types/* -> shared/types/" -ForegroundColor White
Write-Host "  3. src/utils/*.ts -> shared/utils/" -ForegroundColor White
Write-Host "  4. src/store/*Slice.ts -> features/*/store/" -ForegroundColor White
Write-Host "     (uiSlice will remain in src/store for global state)" -ForegroundColor Gray
Write-Host ""
Write-Host "WARNING: You will need to update import paths after this!" -ForegroundColor Red
Write-Host ""

$response = Read-Host "Continue? (y/N)"
if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host "Operation cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting final cleanup..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$moveCount = 0
$errorCount = 0

# ==========================================
# Step 1: Move hooks to shared/hooks
# ==========================================
Write-Host "[Step 1/4] Moving hooks to shared/hooks..." -ForegroundColor Green

if (Test-Path "src\hooks") {
    $hookFiles = Get-ChildItem -Path "src\hooks\*.ts"
    
    if ($hookFiles.Count -gt 0) {
        foreach ($file in $hookFiles) {
            try {
                Move-Item -Path $file.FullName -Destination "src\shared\hooks\$($file.Name)" -Force
                Write-Host "  [OK] Moved $($file.Name) -> shared\hooks\" -ForegroundColor Gray
                $moveCount++
            } catch {
                Write-Host "  [ERROR] Failed to move $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
                $errorCount++
            }
        }
        
        # Remove empty hooks folder
        try {
            Remove-Item -Path "src\hooks" -Recurse -Force -ErrorAction Stop
            Write-Host "  [OK] Deleted src\hooks" -ForegroundColor Gray
        } catch {
            Write-Host "  [WARN] Could not delete src\hooks" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [INFO] No hook files to move" -ForegroundColor Gray
    }
} else {
    Write-Host "  [INFO] src\hooks does not exist" -ForegroundColor Gray
}

Write-Host ""

# ==========================================
# Step 2: Move types to shared/types
# ==========================================
Write-Host "[Step 2/4] Moving types to shared/types..." -ForegroundColor Green

if (Test-Path "src\types") {
    # Move subdirectories and files
    $typeItems = Get-ChildItem -Path "src\types" -Recurse
    
    if ($typeItems.Count -gt 0) {
        # Copy entire directory structure
        Copy-Item -Path "src\types\*" -Destination "src\shared\types\" -Recurse -Force
        
        # Count moved items
        $typeItems | ForEach-Object {
            if (-not $_.PSIsContainer) {
                $relativePath = $_.FullName.Replace("$projectRoot\src\types\", "")
                Write-Host "  [OK] Moved $relativePath -> shared\types\$relativePath" -ForegroundColor Gray
                $moveCount++
            }
        }
        
        # Remove old types folder
        try {
            Remove-Item -Path "src\types" -Recurse -Force -ErrorAction Stop
            Write-Host "  [OK] Deleted src\types" -ForegroundColor Gray
        } catch {
            Write-Host "  [WARN] Could not delete src\types" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [INFO] No type files to move" -ForegroundColor Gray
    }
} else {
    Write-Host "  [INFO] src\types does not exist" -ForegroundColor Gray
}

Write-Host ""

# ==========================================
# Step 3: Move utils to shared/utils
# ==========================================
Write-Host "[Step 3/4] Moving utils to shared/utils..." -ForegroundColor Green

if (Test-Path "src\utils") {
    # Ensure subdirectories exist
    $utilSubdirs = @(
        "src\shared\utils\format",
        "src\shared\utils\validation",
        "src\shared\utils\helpers"
    )
    
    foreach ($dir in $utilSubdirs) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    # Move utils files to appropriate subdirectories
    $utilMappings = @{
        "formatDate.ts" = "src\shared\utils\format\formatDate.ts"
        "validator.ts" = "src\shared\utils\validation\validator.ts"
        "storage.ts" = "src\shared\utils\helpers\storage.ts"
    }
    
    foreach ($fileName in $utilMappings.Keys) {
        $sourcePath = "src\utils\$fileName"
        $destPath = $utilMappings[$fileName]
        
        if (Test-Path $sourcePath) {
            try {
                Move-Item -Path $sourcePath -Destination $destPath -Force
                $destFolder = Split-Path $destPath -Parent | Split-Path -Leaf
                Write-Host "  [OK] Moved $fileName -> shared\utils\$destFolder\" -ForegroundColor Gray
                $moveCount++
            } catch {
                Write-Host "  [ERROR] Failed to move $fileName`: $($_.Exception.Message)" -ForegroundColor Red
                $errorCount++
            }
        }
    }
    
    # Remove empty utils folder
    try {
        $remainingFiles = Get-ChildItem -Path "src\utils" -File
        if ($remainingFiles.Count -eq 0) {
            Remove-Item -Path "src\utils" -Recurse -Force -ErrorAction Stop
            Write-Host "  [OK] Deleted src\utils" -ForegroundColor Gray
        } else {
            Write-Host "  [WARN] src\utils still has files, not deleted:" -ForegroundColor Yellow
            $remainingFiles | ForEach-Object {
                Write-Host "    - $($_.Name)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "  [WARN] Could not delete src\utils" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [INFO] src\utils does not exist" -ForegroundColor Gray
}

Write-Host ""

# ==========================================
# Step 4: Reorganize store slices
# ==========================================
Write-Host "[Step 4/4] Reorganizing store slices..." -ForegroundColor Green

if (Test-Path "src\store") {
    $storeSlices = @{
        "authSlice.ts" = "src\features\auth\store\authSlice.ts"
        "inventorySlice.ts" = "src\features\inventory\store\inventorySlice.ts"
        "recipeSlice.ts" = "src\features\recipe\store\recipeSlice.ts"
    }
    
    foreach ($fileName in $storeSlices.Keys) {
        $sourcePath = "src\store\$fileName"
        $destPath = $storeSlices[$fileName]
        
        if (Test-Path $sourcePath) {
            try {
                Move-Item -Path $sourcePath -Destination $destPath -Force
                $featureName = $destPath.Split('\')[2]
                Write-Host "  [OK] Moved $fileName -> features\$featureName\store\" -ForegroundColor Gray
                $moveCount++
            } catch {
                Write-Host "  [ERROR] Failed to move $fileName`: $($_.Exception.Message)" -ForegroundColor Red
                $errorCount++
            }
        }
    }
    
    # Check if only uiSlice remains
    $remainingSlices = Get-ChildItem -Path "src\store" -File
    if ($remainingSlices.Count -eq 1 -and $remainingSlices[0].Name -eq "uiSlice.ts") {
        Write-Host "  [INFO] uiSlice.ts remains in src\store (global state - keep it here)" -ForegroundColor Cyan
    } elseif ($remainingSlices.Count -eq 0) {
        Write-Host "  [WARN] No slices remaining in src\store - consider creating store configuration" -ForegroundColor Yellow
    } else {
        Write-Host "  [INFO] Remaining files in src\store:" -ForegroundColor Cyan
        $remainingSlices | ForEach-Object {
            Write-Host "    - $($_.Name)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  [INFO] src\store does not exist" -ForegroundColor Gray
}

Write-Host ""

# ==========================================
# Summary
# ==========================================
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Final cleanup completed!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  Files moved: $moveCount" -ForegroundColor White
Write-Host "  Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "White" })
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "SUCCESS: All files moved successfully!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Some files could not be moved. Check errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "IMPORTANT - Next steps:" -ForegroundColor Red
Write-Host "  You MUST update the following import paths:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Hooks:" -ForegroundColor Yellow
Write-Host "     from '@/hooks/*' -> '@/shared/hooks/*'" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Types:" -ForegroundColor Yellow
Write-Host "     from '@/types/*' -> '@/shared/types/*'" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Utils:" -ForegroundColor Yellow
Write-Host "     from '@/utils/formatDate' -> '@/shared/utils/format/formatDate'" -ForegroundColor Gray
Write-Host "     from '@/utils/validator' -> '@/shared/utils/validation/validator'" -ForegroundColor Gray
Write-Host "     from '@/utils/storage' -> '@/shared/utils/helpers/storage'" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Store Slices:" -ForegroundColor Yellow
Write-Host "     from '@/store/authSlice' -> '@/modules/auth/store/authSlice'" -ForegroundColor Gray
Write-Host "     from '@/store/inventorySlice' -> '@/modules/inventory/store/inventorySlice'" -ForegroundColor Gray
Write-Host "     from '@/store/recipeSlice' -> '@/modules/recipe/store/recipeSlice'" -ForegroundColor Gray
Write-Host ""

# Ask if want to show final structure
$showStructure = Read-Host "Show final src folder structure? (y/N)"
if ($showStructure -eq 'y' -or $showStructure -eq 'Y') {
    Write-Host ""
    Write-Host "Final src folder structure:" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    tree src /F /A
}

Write-Host ""
Write-Host "Script execution completed!" -ForegroundColor Green
Write-Host "Remember to update import paths and test your application!" -ForegroundColor Yellow
