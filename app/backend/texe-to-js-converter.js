//input: 21:19:35 12/10/2023
//output: 2023-10-12T21:19:35
export function convertDate(texeString) {
	let matches = /^(\d\d:\d\d:\d\d) (\d{1,2})\/(\d{1,2})\/(\d\d\d\d)$/.exec(texeString)
	if (matches == null) {
		throw new Error(`Unconvertable date: ${texeString}`)
	}
	let [time, date, month, year] = matches.slice(1)
	return Date.parse(`${year}-${month}-${date}T${time}`)
}
