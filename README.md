## Storage Management System management Server

## Local Computer SetUp

# Routing Api for Cyclic deployment and how to run the application locally

# step 1 : npm git -clone https://github.com/sohelrana2250/storage_management.git

# step 2 : cd storage_management

# step 3 : npm i

# ste 4 : include .env

# step 5: npm run start:dev

# step 6: Run Project development stages : npm run start:dev

# postman Application test my API , here is My development statges API

## user postmant collection

# 1. POST http://localhost:3045/api/v1/user/create_user

# 2. PATCH http://localhost:3045/api/v1/user/user_verification

# 3. PATCH http://localhost:3045/api/v1/user/change_password

# 4. GET http://localhost:3045/api/v1/user/my_profile

# 5. PATCH http://localhost:3045/api/v1/user/update_my_profile

# 6. DELETE http://localhost:3045/api/v1/user/delete_my_account

## auth postman collection

# 1. POST http://localhost:3045/api/v1/auth/login_user

# 2. POST http://localhost:3045/api/v1/auth/refresh-token

# 3. PATCH http://localhost:3045/api/v1/auth/forgot_password

# 4. PATCH http://localhost:3045/api/v1/auth/reset_verification

# 5. POST http://localhost:3045/api/v1/auth/social_media_auth

## folder poatman collection

# 1. POST http://localhost:3045/api/v1/folder/create_folder (create folder without password)

# 2. GET http://localhost:3045/api/v1/folder/find_all_folder

# 3. GET http://localhost:3045/api/v1/folder/find_specific_folder/67df7445844f7ab063fbbd0c (folderId)

# 4. PATCH http://localhost:3045/api/v1/folder/update_folder_name/67df7445844f7ab063fbbd0c (folderId)

# 5. PATCH http://localhost:3045/api/v1/folder/delete_folder/67df7e8c13f3f31d146f0ec9(folderId)

# 6. POST http://localhost:3045/api/v1/folder/create_folder(secure folder with password)

## file poatman collection

# 1. POST http://localhost:3045/api/v1/file/uplodeing_file (uplode doc, pdf, image) folder ways

# 2. POST http://localhost:3045/api/v1/file/uplodeing_file (uplode doc, pdf, image) ( file uploding Api With password )

# 3. POST http://localhost:3045/api/v1/file/uplodeing_file (uplode doc, pdf, image) (single file, and folder under file uploding Api)

# 4. GET http://localhost:3045/api/v1/file/find_all_filefolder (Recent Uploding File And Folder (24 hours))

# 5. GET http://localhost:3045/api/v1/file/file_dashboard (File Dashboard API)

# 6. GET http://localhost:3045/api/v1/file/find_all_images

# 7. GET http://localhost:3045/api/v1/file/find_all_folders

# 8. GET http://localhost:3045/api/v1/file/find_all_pdfs

# 9. GET http://localhost:3045/api/v1/file/find_all_docs

# 10. GET http://localhost:3045/api/v1/file/get_all_file_folder_by_date?date=23/03/2025

# 11 .GET http://localhost:3045/api/v1/file/my_favorite_file_folder

# 12 . PATCH http://localhost:3045/api/v1/file/my_favorite/67df76ae382954f2d2b1dcf5 (fileId)

# 13. GET http://localhost:3045/api/v1/file/duplicate_file_and_folder/67df759c33bdfba0aa61c2ab(fileId)

# 14. POST http://localhost:3045/api/v1/file/copy_file/67df759c33bdfba0aa61c2ab (fileId)

# 15. DELETE http://localhost:3045/api/v1/file/delete_file/67df81b74d9dede57d008136(fileId)

# 16. PATCH http://localhost:3045/api/v1/file/rename_file/67df7e5413f3f31d146f0ec5(fileId)

## DisplayLog-file/folder poatman collection

# 1 . POST http://localhost:3045/api/v1/folder/secure_folder/67df7488844f7ab063fbbd10 (folderId)

# 2. POST http://localhost:3045/api/v1/folder/secure_file/67df76099aa3d55794584499 (fileId)

# 3. GET http://localhost:3045/api/v1/file/specific_folder/67df7445844f7ab063fbbd0c(folderId)

# 4 . GET http://localhost:3045/api/v1/file/find_all_log_files (find all log files and folder)

### technology

# 1 Node

# 2 Express

# 3 Mongoose

# 4 Type Script
