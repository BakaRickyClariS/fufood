# ==========================================
# Project Refactoring - Clean Up Old Folders Script
# ==========================================
# Before running, please ensure:
# 1. You have committed current changes with git
# 2. Import paths have been updated
# 3. Dev server is running normally
# ==========================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Project Refactoring - Clean Up Old Folders" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set project root directory
$projectRoot = $PSScriptRoot
Set-Location $projectRoot

Write-Host "Project directory: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Ask user to continue
Write-Host "WARNING: This script will:" -ForegroundColor Yellow
Write-Host "  1. Move remaining old files to new locations" -ForegroundColor White
Write-Host "  2. Delete empty old folders" -ForegroundColor White
Write-Host "  3. Clean up old components structure" -ForegroundColor White
Write-Host ""
Write-Host "Please commit your changes with git first!" -ForegroundColor Red
Write-Host ""

$response = Read-Host "Continue? (y/N)"
if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host "Operation cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting cleanup..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ==========================================
# Step 1: Delete empty folders
# ==========================================
Write-Host "[Step 1/6] Deleting empty folders..." -ForegroundColor Green

if (Test-Path "src\api") {
    Remove-Item -Path "src\api" -Recurse -Force
    Write-Host "  [OK] Deleted src\api" -ForegroundColor Gray
}

if (Test-Path "src\components\ui") {
    Remove-Item -Path "src\components\ui" -Recurse -Force
    Write-Host "  [OK] Deleted src\components\ui" -ForegroundColor Gray
}

Write-Host ""

# ==========================================
# Step 2: Migrate and delete src/data/
# ==========================================
Write-Host "[Step 2/6] Processing src\data\ ..." -ForegroundColor Green

if (Test-Path "src\data\layoutPattern.ts") {
    # Ensure target folder exists
    if (!(Test-Path "src\shared\constants")) {
        New-Item -ItemType Directory -Path "src\shared\constants" -Force | Out-Null
    }
    
    Move-Item -Path "src\data\layoutPattern.ts" -Destination "src\shared\constants\layoutPattern.ts" -Force
    Write-Host "  [OK] Moved layoutPattern.ts -> shared\constants\" -ForegroundColor Gray
}

if (Test-Path "src\data") {
    Remove-Item -Path "src\data" -Recurse -Force
    Write-Host "  [OK] Deleted src\data" -ForegroundColor Gray
}

Write-Host ""

# ==========================================
# Step 3: Migrate and clean src/functions/
# ==========================================
Write-Host "[Step 3/6] Processing src\functions\ ..." -ForegroundColor Green

if (Test-Path "src\functions") {
    # Create target folder
    if (!(Test-Path "src\shared\utils\layout")) {
        New-Item -ItemType Directory -Path "src\shared\utils\layout" -Force | Out-Null
    }
    
    # Move all .ts files
    Get-ChildItem -Path "src\functions\*.ts" | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "src\shared\utils\layout\$($_.Name)" -Force
        Write-Host "  [OK] Moved $($_.Name) -> shared\utils\layout\" -ForegroundColor Gray
    }
    
    # Delete functions folder
    Remove-Item -Path "src\functions" -Recurse -Force
    Write-Host "  [OK] Deleted src\functions" -ForegroundColor Gray
}

Write-Host ""

# ==========================================
# Step 4: Migrate shared components
# ==========================================
Write-Host "[Step 4/6] Migrating shared components..." -ForegroundColor Green

# Feedback
if (Test-Path "src\components\feedback\SWPrompt.tsx") {
    if (!(Test-Path "src\shared\components\feedback")) {
        New-Item -ItemType Directory -Path "src\shared\components\feedback" -Force | Out-Null
    }
    Move-Item -Path "src\components\feedback\SWPrompt.tsx" -Destination "src\shared\components\feedback\SWPrompt.tsx" -Force
    Write-Host "  [OK] Moved SWPrompt.tsx -> shared\components\feedback\" -ForegroundColor Gray
}

# Global/Layout
if (Test-Path "src\components\global\AppContainer.tsx") {
    Move-Item -Path "src\components\global\AppContainer.tsx" -Destination "src\shared\components\layout\AppContainer.tsx" -Force
    Write-Host "  [OK] Moved AppContainer.tsx -> shared\components\layout\" -ForegroundColor Gray
}

# Forms
if (Test-Path "src\components\forms") {
    if (!(Test-Path "src\shared\components\forms")) {
        New-Item -ItemType Directory -Path "src\shared\components\forms" -Force | Out-Null
    }
    
    Get-ChildItem -Path "src\components\forms\*.tsx" | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "src\shared\components\forms\$($_.Name)" -Force
        Write-Host "  [OK] Moved $($_.Name) -> shared\components\forms\" -ForegroundColor Gray
    }
}

Write-Host ""

# ==========================================
# Step 5: Migrate feature-specific components
# ==========================================
Write-Host "[Step 5/6] Migrating feature-specific components..." -ForegroundColor Green

# Inventory Section
if (Test-Path "src\components\layout\InventorySection.tsx") {
    Move-Item -Path "src\components\layout\InventorySection.tsx" -Destination "src\features\inventory\components\InventorySection.tsx" -Force
    Write-Host "  [OK] Moved InventorySection.tsx -> features\inventory\components\" -ForegroundColor Gray
}

# Recipe Section
if (Test-Path "src\components\layout\RecipeSection.tsx") {
    Move-Item -Path "src\components\layout\RecipeSection.tsx" -Destination "src\features\recipe\components\RecipeSection.tsx" -Force
    Write-Host "  [OK] Moved RecipeSection.tsx -> features\recipe\components\" -ForegroundColor Gray
}

# MemberList (shared component)
if (Test-Path "src\components\layout\MemberList.tsx") {
    Move-Item -Path "src\components\layout\MemberList.tsx" -Destination "src\shared\components\layout\MemberList.tsx" -Force
    Write-Host "  [OK] Moved MemberList.tsx -> shared\components\layout\" -ForegroundColor Gray
}

# Inventory subfolder all files
if (Test-Path "src\components\layout\inventory") {
    Get-ChildItem -Path "src\components\layout\inventory\*.tsx" | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "src\features\inventory\components\$($_.Name)" -Force
        Write-Host "  [OK] Moved $($_.Name) -> features\inventory\components\" -ForegroundColor Gray
    }
}

Write-Host ""

# ==========================================
# Step 6: Clean up old components folder
# ==========================================
Write-Host "[Step 6/6] Cleaning up old folder structure..." -ForegroundColor Green

# Delete empty subfolders
$foldersToRemove = @(
    "src\components\feedback",
    "src\components\forms",
    "src\components\global",
    "src\components\layout\inventory",
    "src\components\layout"
)

foreach ($folder in $foldersToRemove) {
    if (Test-Path $folder) {
        try {
            Remove-Item -Path $folder -Recurse -Force -ErrorAction Stop
            Write-Host "  [OK] Deleted $folder" -ForegroundColor Gray
        } catch {
            Write-Host "  [WARN] Cannot delete $folder (may have remaining files)" -ForegroundColor Yellow
        }
    }
}

# Try to delete entire components folder (if empty)
if (Test-Path "src\components") {
    $remainingItems = Get-ChildItem -Path "src\components" -Recurse
    if ($remainingItems.Count -eq 0) {
        Remove-Item -Path "src\components" -Recurse -Force
        Write-Host "  [OK] Deleted src\components (empty)" -ForegroundColor Gray
    } else {
        Write-Host "  [WARN] src\components has remaining files, not deleted" -ForegroundColor Yellow
        Write-Host "    Remaining items:" -ForegroundColor Yellow
        $remainingItems | ForEach-Object {
            Write-Host "      - $($_.FullName.Replace($projectRoot, ''))" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Cleanup completed!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Check if dev server is running normally" -ForegroundColor White
Write-Host "  2. Test all page functionality" -ForegroundColor White
Write-Host "  3. Use 'git status' to view changes" -ForegroundColor White
Write-Host "  4. Use 'git add . && git commit' to commit changes" -ForegroundColor White
Write-Host ""

# Ask if want to show remaining src structure
$showStructure = Read-Host "Show cleaned src folder structure? (y/N)"
if ($showStructure -eq 'y' -or $showStructure -eq 'Y') {
    Write-Host ""
    Write-Host "Cleaned src folder structure:" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    tree src /F /A
}

Write-Host ""
Write-Host "Script execution completed!" -ForegroundColor Green
