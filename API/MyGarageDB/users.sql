CREATE TABLE [dbo].[users]
(
	[userID] INT NOT NULL PRIMARY KEY, 
    [username] NVARCHAR(50) NOT NULL, 
    [password] NVARCHAR(50) NOT NULL, 
    [last_login] DATETIME2 NULL DEFAULT NULL, 
    [is_admin] BIT NOT NULL DEFAULT 0, 
    [email] NVARCHAR(50) NOT NULL, 
    [access_token] NVARCHAR(MAX) NULL DEFAULT NULL, 
    [addressID] INT NOT NULL 
)
