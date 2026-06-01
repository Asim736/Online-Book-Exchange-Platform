$ErrorActionPreference = "SilentlyContinue"
$root = "c:\Users\Asim SB\Documents\FinalDeliverables\final start\Final Year Project (BC 200205775)"
cd $root

# 1. Delete folders and files
$itemsToDelete = @(
    "aws",
    "amplify.yml",
    "server\config\s3.js",
    "server\middleware\upload.js",
    "server\scripts\backfill-thumbnails.js"
)

foreach ($item in $itemsToDelete) {
    $fullPath = Join-Path $root $item
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Recurse -Force
        Write-Output "Deleted: $item"
    }
}

# 2. Update server/.env
$envPath = "$root\server\.env"
@"
MONGODB_URI=mongodb+srv://upskillasim_db_user:BJ681GjM55wA1QRQ@bookexchangecluster.vrqhqv8.mongodb.net/bookexchange
PORT=5001
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173
"@ | Set-Content $envPath
Write-Output "Updated: server/.env"

# 3. Update server/.env.example
$envExPath = "$root\server\.env.example"
@"
# Server Environment Variables

MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
JWT_SECRET=<JWT_SECRET>
PORT=5001
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173
"@ | Set-Content $envExPath
Write-Output "Updated: server/.env.example"

# 4. Update client/.env.production
$clientEnvProdPath = "$root\client\.env.production"
@"
VITE_API_URL=https://your-render-backend-url.onrender.com/api
NODE_ENV=production
"@ | Set-Content $clientEnvProdPath
Write-Output "Updated: client/.env.production"

Write-Output "Phase 1 Complete: Files and env configs cleaned"
