/**
 * Parses a content string/object and returns the localized version based on the locale.
 * Handles JSON strings in format {"en": "...", "fr": "..."}
 * 
 * @param {string|object} content - The content to parse
 * @param {string} locale - The current locale code (e.g. 'en', 'fr')
 * @returns {string} The localized content
 */
export const getLocalizedContent = (content, locale) => {
  if (!content) return ''

  let parsedContent = content

  // If content is a string, try to parse it as JSON
  if (typeof content === 'string') {
    const trimmed = content.trim()
    // Optimistically check for JSON object structure
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        parsedContent = JSON.parse(content)
      } catch (e) {
        // Not valid JSON, return original string
        return content
      }
    } else {
      // Not a JSON object string, return original
      return content
    }
  }

  // If parsedContent is a plain object, try to get the localized string
  if (typeof parsedContent === 'object' && parsedContent !== null && !Array.isArray(parsedContent)) {
    if (parsedContent[locale]) {
      return parsedContent[locale]
    }
    // Fallback strategy:
    // 1. Try 'en'
    // 2. Try 'fr'
    // 3. Try 'ar'
    // 4. Return first available value
    if (parsedContent['en']) return parsedContent['en']
    if (parsedContent['fr']) return parsedContent['fr']
    if (parsedContent['ar']) return parsedContent['ar']
    
    const keys = Object.keys(parsedContent)
    if (keys.length > 0) {
      return parsedContent[keys[0]]
    }
  }

  // If it's not an object (e.g. array or primitive after parsing) or structure doesn't match
  return typeof content === 'string' ? content : JSON.stringify(content)
}