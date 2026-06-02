const STOP_WORDS = new Set([
  "از",
  "است",
  "اگر",
  "اما",
  "این",
  "آیا",
  "با",
  "به",
  "برای",
  "در",
  "را",
  "شد",
  "شده",
  "شود",
  "که",
  "کند",
  "کنند",
  "می",
  "نه",
  "و",
  "یا",
  "چیست",
  "چقدر",
  "چه",
])

/**
 *
 * @param text text to normalize and split
 * @returns searchable tokens with stop words removed
 */
export function tokenize(text: string): string[] {
  return (normalizeText(text).match(/[\p{L}\p{N}]+/gu) ?? []).filter(
    (token) => !STOP_WORDS.has(token),
  )
}

/**
 *
 * @param documents tokenized documents
 * @returns inverse document frequency by token
 */
export function calculateInverseDocumentFrequency(documents: string[][]) {
  const documentFrequency = new Map<string, number>()

  for (const document of documents) {
    for (const token of new Set(document)) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
    }
  }

  const idf = new Map<string, number>()

  for (const [token, frequency] of documentFrequency) {
    idf.set(token, Math.log((documents.length + 1) / (frequency + 1)) + 1)
  }

  return idf
}

/**
 *
 * @param tokens document tokens
 * @param idf inverse document frequency by token
 * @returns TF-IDF vector
 */
export function vectorize(tokens: string[], idf: Map<string, number>) {
  const vector = new Map<string, number>()

  if (tokens.length === 0) {
    return vector
  }

  const tokenCounts = new Map<string, number>()

  for (const token of tokens) {
    tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1)
  }

  for (const [token, count] of tokenCounts) {
    vector.set(token, (count / tokens.length) * (idf.get(token) ?? 0))
  }

  return vector
}

/**
 *
 * @param leftVector first TF-IDF vector
 * @param rightVector second TF-IDF vector
 * @returns cosine similarity score
 */
export function cosineSimilarity(
  leftVector: Map<string, number>,
  rightVector: Map<string, number>,
) {
  let dotProduct = 0
  let leftMagnitude = 0
  let rightMagnitude = 0

  for (const value of leftVector.values()) {
    leftMagnitude += value * value
  }

  for (const value of rightVector.values()) {
    rightMagnitude += value * value
  }

  for (const [token, leftValue] of leftVector) {
    dotProduct += leftValue * (rightVector.get(token) ?? 0)
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0
  }

  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude))
}

/**
 *
 * @param text text to normalize
 * @returns normalized text
 */
function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[أإآ]/g, "ا")
    .replace(/[ًٌٍَُِّْ]/g, "")
}
