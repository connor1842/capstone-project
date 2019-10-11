CREATE TABLE [dbo].[complexes]
(
	[complexID] INT NOT NULL PRIMARY KEY, 
    [street_address] NVARCHAR(50) NULL, 
    [city] NVARCHAR(50) NULL, 
    [state] NVARCHAR(50) NULL, 
    [num_units] INT NOT NULL DEFAULT 0, 
    [master_complexID] INT NULL, 
    CONSTRAINT [FK_complexes_complexes] FOREIGN KEY ([master_complexID]) REFERENCES [complexes]([complexID])
)
