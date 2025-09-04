// This script creates the uploads directory if it doesn't exist
// Run this during your build or deployment process

const fs = require('fs')
const path = require('path')

const uploadsDir = path.join(process.cwd(), 'uploads')

if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...')
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('Uploads directory created at:', uploadsDir)
} else {
  console.log('Uploads directory already exists at:', uploadsDir)
}
