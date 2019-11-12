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
JOIn track t 
ON t.TrackId = pt.TrackId
GROUP BY p.PlaylistId, p.Name
HAVING AVG(t.milliseconds) >
(SELECT 
		AVG(plDuree.AvgTime)
FROM 
	(SELECT 
		p.PlaylistId,
		AVG(t.milliseconds) as "AvgTime"
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
const q5 = ``
const q6 = ``
const q7 = ``
const q8 = ``
const q9 = ``
const q10 = ``
const q11 = ``
const q12 = ``
const q13 = ``
const q14 = ``
const q15 = ``
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