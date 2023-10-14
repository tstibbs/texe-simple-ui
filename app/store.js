const items = {}

export function getStoredVal(key) {
	return items[key]
}

export function storeVal(key, val) {
	items[key] = val
}
