const name = "rémi-feydit"
const promo = "B2A"

const q1 = `
SELECT Name 
FROM Track 
WHERE Milliseconds < (SELECT Milliseconds FROM Track WHERE TrackId = 3457)
`
const q2 = `
SELECT Name 
FROM Track 
WHERE MediaTypeId = (SELECT MediaTypeId FROM Track WHERE Name = 'Rehab')
`
const q3 = `
SELECT p.PlaylistId, p.Name, COUNT(pt.trackId) as "Number of tracks", SUM(t.Milliseconds)/1000 as "Time", AVG(t.milliseconds)/1000 as "Moyenne temps track"
FROM Playlist p
JOIN PlaylistTrack pt
ON p.PlaylistId = pt.PlaylistId
JOIn track t 
ON t.TrackId = pt.TrackId
GROUP BY p.PlaylistId, p.Name
ORDER BY p.PlaylistId
`
const q4 = `
SELECT p.PlaylistId, p.Name
FROM Playlist p
JOIN PlaylistTrack pt
ON p.PlaylistId = pt.PlaylistId
JOIN track t 
ON t.TrackId = pt.TrackId
GROUP BY p.PlaylistId, p.Name
HAVING SUM(t.milliseconds) >
(SELECT 
		AVG(plDuree.AvgTime)
FROM 
	(SELECT 
		p.PlaylistId,
		sum(cast(t.milliseconds as numeric(12, 0))) as "AvgTime"
	FROM 
		Playlist p
		JOIN PlaylistTrack pt
		ON p.PlaylistId = pt.PlaylistId
		JOIn track t 
		ON t.TrackId = pt.TrackId
	GROUP BY p.PlaylistId
	) plDuree
)
`
const q5 = `
SELECT nbTrackList.playlistId, nbTrackList.name
FROM
(SELECT pt.playlistId, p.name, COUNT(pt.trackId) as "NbTrack"
FROM PlaylistTrack pt
JOIN playlist p
ON p.PlaylistId = pt.PlaylistId
GROUP BY pt.PlaylistId, p.name) nbTrackList
JOIN 
(SELECT pt.playlistId, COUNT(pt.trackId) as "NbTrack"
FROM PlaylistTrack pt
JOIN playlist p
ON p.playlistId = pt.playlistId
WHERE pt.PlaylistId IN (1, 13)
GROUP BY pt.PlaylistId) nbTrack1And13
ON nbTrackList.nbTrack = nbTrack1And13.nbTrack
WHERE nbTrackList.playlistId NOT IN (1, 13)
`
const q6 = `
SELECT CONCAT(c.FirstName, ' ', c.LastName) as "customerName"
FROM Customer c
JOIN Invoice i
ON c.CustomerId = i.CustomerId
WHERE i.Total > (SELECT MAX(Total)
				 FROM Invoice
				 WHERE LOWER(billingCountry) = 'france');
`
const q7 = `
SELECT billingCountry, min(total) as "min", max(total) as "max", COUNT(Total) as "nbCommande", (COUNT(Total) / (SELECT COUNT(Total)*1.0 FROM Invoice))*100 as "Moyenne commande", SUM(Total) / (SELECT SUM(Total) FROM Invoice) as "Moyenne total"
FROM Invoice
GROUP BY BillingCountry
`
const q8 = `
SELECT t.TrackId, t.Name, t.AlbumId, t.MediaTypeId, t.GenreId, t.Composer, t.Milliseconds, t.Bytes, t.UnitPrice, (SELECT AVG(UnitPrice) FROM Track) as "Prix Moyen Global", (SELECT AVG(t.UnitPrice) FROM Track t JOIN MediaType mt2 ON t.MediaTypeId = mt2.MediaTypeId WHERE mt1.MediaTypeId = mt2.MediaTypeId GROUP BY t.MediaTypeId, mt2.Name) as "Moyenne du média"
FROM track t
JOIN MediaType mt1
ON t.MediaTypeId = mt1.MediaTypeId
WHERE t.UnitPrice > (SELECT AVG(UnitPrice) FROM Track)
`
const q9 = `
SELECT t.TrackId, t.Name, t.AlbumId, t.MediaTypeId, t.GenreId, t.Composer, t.Milliseconds, t.Bytes, t.UnitPrice, g1.Name as "NameGenre", (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.UnitPrice) OVER (PARTITION BY g2.Name) AS medianMedia FROM Track t JOIN Genre g2  ON t.GenreId = g2.GenreId WHERE g1.genreId = g2.GenreId GROUP BY t.genreId, g2.Name, t.UnitPrice) as "medianMedia"
FROM track t
JOIN genre g1
ON t.GenreId = g1.GenreId
WHERE t.UnitPrice < (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.UnitPrice) OVER (PARTITION BY g2.Name) AS medianMedia FROM Track t JOIN Genre g2 ON t.GenreId = g2.GenreId WHERE g1.genreId = g2.GenreId GROUP BY t.genreId, g2.Name, t.UnitPrice)
`
const q10 = `
SELECT pt1.playlistId, a1.artistId, 
						(SELECT COUNT(DISTINCT a2.artistId)
						FROM playlisttrack pt2 
						JOIN Track t
						ON t.TrackId = pt2.TrackId 
						JOIN album a2
						ON a2.albumid = t.albumId 
						WHERE pt1.playlistId = pt2.playListId 
						GROUP BY pt2.PlaylistId) as "nbArtistByPlayList",
						(SELECT COUNT(DISTINCT t.trackId)
						FROM playlisttrack pt2
						JOIN Track t 
						ON t.TrackId = pt2.TrackId 
						JOIN album a3
						ON a3.albumid = t.albumId
						WHERE a1.ArtistId = a3.artistId
						GROUP BY a3.artistId) as "nbChansonByArtist",
						(SELECT AVG(t.UnitPrice) as "Nombres artistes"
						FROM playlisttrack pt2
						JOIN Track t 
						ON t.TrackId = pt2.TrackId 
						JOIN album a3
						ON a3.albumid = t.albumId
						WHERE a1.ArtistId = a3.artistId
						GROUP BY a3.artistId) as "avgTrackPrince",
						(SELECT max(nbArtist.nbArtistByPlaylist)
						FROM
						(
						SELECT COUNT(DISTINCT a2.artistId) as "nbArtistByPlaylist"
						FROM playlisttrack pt2 
						JOIN Track t
						ON t.TrackId = pt2.TrackId 
						JOIN album a2
						ON a2.albumid = t.albumId 
						GROUP BY pt2.PlaylistId
						) nbArtist) as "maxArtistByPlaylist" 
FROM PlaylistTrack pt1
JOIN Track t1
ON t1.TrackId = pt1.TrackId 
JOIN album a1
ON a1.albumid = t1.albumId 
`
const q11 = `
SELECT pays.Country, COUNT(pays.country) as "nbPays"
FROM
(
SELECT e.Country
FROM employee e
UNION ALL
SELECT c.Country
FROM customer c
UNION ALL
SELECT i.BillingCountry
FROM invoice i
) pays
GROUP BY pays.Country
`
const q12 = `
SELECT pays.Country as "Pays", COUNT(pays.country) as "Total",
					ISNULL((SELECT COUNT(country)
					FROM Employee
					WHERE pays.country = Country
					GROUP BY Country), 0) as "Employee",
					(SELECT COUNT(country)
					FROM Customer
					WHERE pays.country = Country
					GROUP BY Country) as "Customer", 
					(SELECT COUNT(Billingcountry)
					FROM Invoice
					WHERE pays.Country = BillingCountry
					GROUP BY BIllingCountry) as "Invoice"

FROM
(
SELECT e.Country
FROM employee e
UNION ALL
SELECT c.Country
FROM customer c
UNION ALL
SELECT i.BillingCountry
FROM invoice i
) pays
GROUP BY pays.Country
`
const q13 = `
SELECT Invoice.InvoiceId
            FROM Invoice
            JOIN InvoiceLine
              ON InvoiceLine.InvoiceId = Invoice.InvoiceId
            JOIN Track t
              ON T.TrackId = InvoiceLine.TrackId
            WHERE T.Milliseconds IN (SELECT MAX(Milliseconds)
                          FROM Track
                          JOIN Genre
                            ON Genre.GenreId = Track.GenreId
                          WHERE T.GenreId = Genre.GenreId
                          GROUP BY genre.Name)
GROUP BY Invoice.InvoiceId;
`
const q14 = `
SELECT i2.invoiceId, SUM(i2.total) / COUNT(t.trackId) as "average",
(SELECT SUM(Milliseconds)/1000 as "temps"
FROM Invoice i
JOIN InvoiceLine il
ON i.InvoiceId = il.InvoiceId
JOIN Track t
ON t.TrackId = il.TrackId
WHERE i2.invoiceId = i.InvoiceId
GROUP BY i.InvoiceId) as "totalTimeTrack",
(SELECT (SELECT Total FROM Invoice WHERE i.InvoiceId = Invoice.InvoiceId) / (SUM(Milliseconds)/1000) as "coût par seconde"
FROM Invoice i
JOIN InvoiceLine il
ON i.InvoiceId = il.InvoiceId
JOIN Track t
ON t.TrackId = il.TrackId
WHERE i2.invoiceId = i.InvoiceId
GROUP BY i.InvoiceId) "coutSeconds"

FROM Invoice i2
JOIN InvoiceLine il
ON i2.InvoiceId = il.InvoiceId
JOIN Track t
ON t.TrackId = il.TrackId
GROUP BY i2.InvoiceId
ORDER BY i2.InvoiceId;
`
const q15 = `
SELECT lastName, FirstName,
							ISNULL((SELECT COUNT(InvoiceId)
							FROM Employee e
							JOIN Customer c
							ON e.EmployeeId = c.SupportRepId
							JOIN Invoice i
							ON c.CustomerId = i.CustomerId
							WHERE e1.employeeId = e.employeeid
							GROUP BY e.EmployeeId), 0) as "totalVente",
							ISNULL((SELECT i.BillingCountry
							FROM Employee e
							JOIN Customer c
							ON e.EmployeeId = c.SupportRepId
							JOIN Invoice i
							ON c.CustomerId = i.CustomerId
							WHERE e1.employeeId = e.employeeid
							GROUP BY e.EmployeeId, i.BillingCountry
							HAVING COUNT(i.billingCountry) IN (SELECT max(nbCountry.nb)
															  FROM 
															  (
															  SELECT employeeId, COUNT(i.billingCountry) as "nb"
															  FROM Employee e
															  JOIN Customer c
															  ON e.EmployeeId = c.SupportRepId
															  JOIN Invoice i
															  ON c.CustomerId = i.CustomerId
															  GROUP BY e.EmployeeId, i.BillingCountry
															  ) nbCountry
															  GROUP BY EmployeeId)), 'N/A') as "pays",
							ISNULL((SELECT g.Name
									FROM Employee e
									JOIN Customer c
									ON e.EmployeeId = c.SupportRepId
									JOIN Invoice i
									ON c.CustomerId = i.CustomerId
									JOIN invoiceline il
									ON i.invoiceId = il.InvoiceId
									JOIN Track t
									ON il.TrackId = t.TrackId
									JOIN Genre g
									ON t.GenreId = g.GenreId
									WHERE e1.employeeId = e.employeeid
									GROUP BY e.EmployeeId, g.Name
									HAVING COUNT(t.genreId) IN (SELECT max(nbGenre.nb)
																		FROM 
																		(
																		SELECT employeeId, COUNT(t.genreId) as "nb"
																		FROM Employee e
																		JOIN Customer c
																		ON e.EmployeeId = c.SupportRepId
																		JOIN Invoice i
																		ON c.CustomerId = i.CustomerId
																		JOIN invoiceline il
																		ON i.invoiceId = il.InvoiceId
																		JOIN Track t
																		ON il.TrackId = t.TrackId
																		GROUP BY e.EmployeeId, t.genreId
																		) nbGenre
																		GROUP BY EmployeeId)), 'N/A') as "mostGenre",
							ISNULL((SELECT (COUNT(InvoiceId) / (SELECT MAX(cast(maxVente.nbVentes as decimal(3, 0)))
							FROM
							(
							SELECT COUNT(InvoiceId) as "nbVentes"
							FROM Employee e
							JOIN Customer c
							ON e.EmployeeId = c.SupportRepId
							JOIN Invoice i
							ON c.CustomerId = i.CustomerId
							GROUP BY e.EmployeeId
							) maxVente))*100 as '% ventes par rapport au meilleur vendeurs'
							FROM Employee e
							JOIN Customer c
							ON e.EmployeeId = c.SupportRepId
							JOIN Invoice i
							ON c.CustomerId = i.CustomerId
							WHERE e1.employeeId = e.employeeid
							GROUP BY e.EmployeeId
							HAVING COUNT(InvoiceId) != (SELECT MAX(maxVente.nbVentes)
														FROM
														(
														SELECT COUNT(InvoiceId) as "nbVentes"
														FROM Employee e
														JOIN Customer c
														ON e.EmployeeId = c.SupportRepId
														JOIN Invoice i
														ON c.CustomerId = i.CustomerId
														GROUP BY e.EmployeeId
														) maxVente)), 0) as "% ventes par rapport au meilleur vendeurs"
FROM Employee e1;
`
const q16 = `
SELECT resultat.LastName, resultat.FirstName
FROM
    (
        SELECT TOP 3 Employee.LastName, Employee.FirstName, COUNT(Employee.EmployeeId) nbrVente
    FROM Employee
    JOIN Customer
        ON Employee.EmployeeId = Customer.SupportRepId
    JOIN Invoice
        ON Customer.CustomerId = Invoice.CustomerId
    GROUP BY Employee.LastName, Employee.FirstName
    ORDER BY nbrVente DESC
    )resultat
WHERE resultat.nbrVente = (    SELECT MIN(resultat2.nbrVente)
                            FROM
                            (
                                SELECT TOP 3 Employee.LastName, Employee.FirstName, COUNT(EmployeeId) nbrVente
                                FROM Employee
                                JOIN Customer
                                    ON Employee.EmployeeId = Customer.SupportRepId
                                JOIN Invoice
                                    ON Customer.CustomerId = Invoice.CustomerId
                                GROUP BY Employee.LastName, Employee.FirstName
                                ORDER BY nbrVente DESC
							)resultat2);
`
const q17 = `
SELECT playlistId, ((SELECT COUNT(t.trackId) as "jsp"
					FROM Playlist p2
					JOIN PlaylistTrack pt
					ON p2.PlaylistId = pt.PlaylistId
					JOIN Track t
					ON pt.TrackId = t.TrackId
					WHERE t.TrackId IN (SELECT t.TrackId
									  FROM InvoiceLine il
									  JOIN Track t
									  ON il.TrackId = t.TrackId
									  GROUP BY t.trackId
									  HAVING COUNT(il.trackId) = 2)
					AND p1.PlaylistId = p2.PlaylistId
					GROUP BY p2.PlaylistId) / CAST((SELECT COUNT(pt.PlaylistId) as "Number of tracks"
												FROM Playlist p2
												JOIN PlaylistTrack pt
												ON p2.PlaylistId = pt.PlaylistId
												JOIn track t 
												ON t.TrackId = pt.TrackId
												WHERE p1.PlaylistId = p2.playlistId
												GROUP BY p2.PlaylistId) as numeric(12,0)))*100 as "% de chansons dans la playlist vendus + de 2 fois"
FROM Playlist p1;
`
const q18 = `
IF EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = N'Bddtp')
BEGIN
    ALTER DATABASE [Bddtp] SET OFFLINE WITH ROLLBACK IMMEDIATE;
    ALTER DATABASE [Bddtp] SET ONLINE;
    DROP DATABASE [Bddtp];
END

CREATE DATABASE [Bddtp];
GO

USE [Bddtp];
GO

CREATE TABLE [dbo].[User] (
    id int IDENTITY(1,1) primary key NOT NULL,
    username varchar(255),
    email varchar(255),
    superuser bit
);
GO
CREATE TABLE [dbo].[Group] (
    id int IDENTITY(1,1) primary key NOT NULL,
    name varchar(255),
    display_name varchar(255),
    description varchar(255)
);
GO
CREATE TABLE [dbo].[User_Group] (
    user_id int FOREIGN KEY REFERENCES [User](id) NOT NULL,
    group_id int FOREIGN KEY REFERENCES [Group](id) NOT NULL,
);
GO
CREATE TABLE [dbo].[Role] (
    id int IDENTITY(1,1) primary key NOT NULL,
    name varchar(255),
    display_name varchar(255),
    description varchar(255)
);
GO
CREATE TABLE [dbo].[Group_Role] (
    group_id int FOREIGN KEY REFERENCES [Group](id) NOT NULL,
    role_id int FOREIGN KEY REFERENCES [Role](id) NOT NULL,
);
GO
CREATE TABLE [dbo].[User_Role] (
    user_id int FOREIGN KEY REFERENCES [User](id) NOT NULL,
    role_id int FOREIGN KEY REFERENCES [Role](id) NOT NULL,
);
GO
CREATE TABLE [dbo].[Permission] (
    id int IDENTITY(1,1) primary key NOT NULL,
    name varchar(255),
    display_name varchar(255),
    description varchar(255)
);
GO
CREATE TABLE [dbo].[Role_Permission] (
    role_id int FOREIGN KEY REFERENCES [Role](id) NOT NULL,
    permission_id int FOREIGN KEY REFERENCES Permission(id) NOT NULL,
);
GO
`
const q19 = `
INSERT INTO Track (Name, MediaTypeId, GenreId, Composer, Milliseconds, UnitPrice)
VALUES
('Paradis', 1, 17, 'Orelsan', 195000, 0.99),
('ASB', 1, 17, 'Vald', 227000, 0.99),
('Au DD', 1, 17, 'PNL', 295000,0.99);
`
const q20 = `
INSERT INTO Employee (LastName, FirstName, Country)
VALUES
('Feydit', 'Rémi', 'France'),
('Caselles', 'Mathieu', 'France');
`
const q21 = `
ALTER TABLE InvoiceLine NOCHECK CONSTRAINT FK_InvoiceLineInvoiceId;
DELETE FROM Invoice WHERE InvoiceDate LIKE '%2010%';
ALTER TABLE InvoiceLine CHECK CONSTRAINT FK_InvoiceLineInvoiceId;
`
const q22 = `
UPDATE Invoice
SET CustomerId = (
    SELECT TOP 1 c.CustomerId
	FROM Customer c
	JOIN Invoice i
	ON c.CustomerId = i.CustomerId
	WHERE c.Country = 'France'
	GROUP BY c.CustomerId
	HAVING COUNT(InvoiceId) = (SELECT max(test.oui) as jsp
						 FROM 
						 (SELECT c.CustomerId, COUNT(c.CustomerId) as 'oui'
						 FROM Customer c
						 JOIN Invoice i
						 ON c.CustomerId = i.CustomerId
						 WHERE c.Country = 'France'
						 GROUP BY c.CustomerId
						 ) test)
)
WHERE BillingCountry = 'Germany' AND InvoiceDate BETWEEN '2011-01-02 00:00:00.000' AND '2014-01-01 00:00:00.000';
`
const q23 = `
UPDATE Invoice
SET Invoice.BillingCountry = Customer.Country
FROM Invoice
JOIN Customer
ON Customer.CustomerId = Invoice.InvoiceId
WHERE Invoice.BillingCountry != Customer.Country
`
const q24 = `
ALTER TABLE Employee
ADD Salary INT
`
const q25 = `
UPDATE Employee
SET Salary = (RAND(CHECKSUM(NEWID())) * 70000 + 30000);
`
const q26 = `
ALTER TABLE dbo.Invoice
DROP COLUMN BillingPostalCode;
`











































// NE PAS TOUCHER CETTE SECTION
const tp = {name: name, promo: promo, queries: [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18, q19, q20, q21, q22, q23, q24, q25, q26]}
module.exports = tp
