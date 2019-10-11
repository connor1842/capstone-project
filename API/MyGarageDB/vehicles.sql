CREATE TABLE [dbo].[vehicles]
(
	[vehicleID] INT NOT NULL PRIMARY KEY, 
    [make] NCHAR(10) NOT NULL, 
    [model] NCHAR(10) NOT NULL, 
    [year] INT NOT NULL, 
    [plate] NCHAR(10) NOT NULL, 
    [color] NVARCHAR(50) NOT NULL, 
    [is_guest] BIT NOT NULL DEFAULT 0, 
    [is_blocked] BIT NOT NULL DEFAULT 0, 
    [last_entry] DATETIME NULL DEFAULT NULL, 
    [expiration_date] DATETIME NOT NULL, 
    [addressID] INT NOT NULL, 
    CONSTRAINT [FK_vehicles_address] FOREIGN KEY ([addressID]) REFERENCES [addresses]([addressID])
)
