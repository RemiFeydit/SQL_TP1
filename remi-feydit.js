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
SELECT pays.Country, COUNT(pays.country) as "nbPays",
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
			GROUP BY Invoice.InvoiceId
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
ORDER BY i2.InvoiceId
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
															  GROUP BY EmployeeId)), 'N/A') as "pays"
FROM Employee e1
`
const q16 = ``
const q17 = ``
const q18 = ``
const q19 = ``
const q20 = ``
const q21 = ``
const q22 = ``
const q23 = ``
const q24 = ``
const q25 = ``
const q26 = ``











































// NE PAS TOUCHER CETTE SECTION
const tp = {name: name, promo: promo, queries: [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18, q19, q20, q21, q22, q23, q24, q25, q26]}
module.exports = tp
