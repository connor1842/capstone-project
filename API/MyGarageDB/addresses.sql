CREATE TABLE [dbo].[addresses]
(
	[addressID] INT NOT NULL PRIMARY KEY, 
    [unit_number] INT NOT NULL, 
    [complexID] INT NOT NULL, 
    [num_vehicles] INT NOT NULL DEFAULT 0, 
    [num_tenants] INT NOT NULL DEFAULT 0, 
    CONSTRAINT [FK_addresses_complexes] FOREIGN KEY ([complexID]) REFERENCES [complexes]([complexID])
)
