package compiler

import (
	"strings"
)

// CitationRef records the order a citation key was first encountered.
type CitationRef struct {
	Key   string `json:"key"`
	Index int    `json:"index"`
}

// BibEntry represents a single BibTeX bibliography entry.
type BibEntry struct {
	Key          string `json:"key"`
	Type         string `json:"type"`
	Author       string `json:"author,omitempty"`
	Title        string `json:"title,omitempty"`
	Year         string `json:"year,omitempty"`
	Journal      string `json:"journal,omitempty"`
	Booktitle    string `json:"booktitle,omitempty"`
	Publisher    string `json:"publisher,omitempty"`
	Pages        string `json:"pages,omitempty"`
	Volume       string `json:"volume,omitempty"`
	Number       string `json:"number,omitempty"`
	Url          string `json:"url,omitempty"`
	Note         string `json:"note,omitempty"`
	Howpublished string `json:"howpublished,omitempty"`
}

// ParseBibTeX parses BibTeX source content and returns bibliography entries.
func ParseBibTeX(content string) []BibEntry {
	var entries []BibEntry
	i := 0
	n := len(content)

	for i < n {
		// Advance to next '@'
		for i < n && content[i] != '@' {
			i++
		}
		if i >= n {
			break
		}
		i++ // skip '@'

		// Read entry type (letters only)
		typeStart := i
		for i < n && isBibAlpha(content[i]) {
			i++
		}
		entryType := strings.ToLower(content[typeStart:i])

		// Skip whitespace then find opening brace/paren
		for i < n && content[i] != '{' && content[i] != '(' {
			i++
		}
		if i >= n {
			break
		}
		closeDelim := byte('}')
		if content[i] == '(' {
			closeDelim = ')'
		}
		i++ // skip opening delimiter

		// Skip non-data entry types
		if entryType == "comment" || entryType == "preamble" || entryType == "string" {
			depth := 1
			for i < n && depth > 0 {
				if content[i] == '{' {
					depth++
				} else if content[i] == closeDelim {
					depth--
				}
				i++
			}
			continue
		}

		// Skip whitespace before key
		for i < n && isBibSpace(content[i]) {
			i++
		}

		// Read citation key
		keyStart := i
		for i < n && content[i] != ',' && content[i] != closeDelim && !isBibSpace(content[i]) {
			i++
		}
		key := strings.TrimSpace(content[keyStart:i])

		// Skip whitespace and comma
		for i < n && isBibSpace(content[i]) {
			i++
		}
		if i < n && content[i] == ',' {
			i++
		}

		entry := BibEntry{Key: key, Type: entryType}

	fieldLoop:
		for i < n {
			// Skip whitespace
			for i < n && isBibSpace(content[i]) {
				i++
			}
			if i >= n || content[i] == closeDelim {
				if i < n {
					i++
				}
				break fieldLoop
			}

			// Read field name
			fieldStart := i
			for i < n && content[i] != '=' && content[i] != closeDelim && !isBibSpace(content[i]) {
				i++
			}
			fieldName := strings.ToLower(strings.TrimSpace(content[fieldStart:i]))

			// Skip whitespace + '='
			for i < n && (isBibSpace(content[i]) || content[i] == '=') {
				i++
			}
			if i >= n {
				break fieldLoop
			}

			// Read field value
			var value string
			switch content[i] {
			case '{':
				i++
				depth := 1
				valueStart := i
				for i < n && depth > 0 {
					if content[i] == '{' {
						depth++
					} else if content[i] == '}' {
						depth--
						if depth == 0 {
							break
						}
					}
					i++
				}
				value = content[valueStart:i]
				if i < n {
					i++ // skip '}'
				}
			case '"':
				i++
				valueStart := i
				for i < n && content[i] != '"' {
					i++
				}
				value = content[valueStart:i]
				if i < n {
					i++ // skip '"'
				}
			default:
				// Unquoted value (usually a number like year = 2023)
				valueStart := i
				for i < n && content[i] != ',' && content[i] != closeDelim && !isBibSpace(content[i]) {
					i++
				}
				value = strings.TrimSpace(content[valueStart:i])
			}

			value = cleanBibValue(value)

			// Populate known fields
			switch fieldName {
			case "author", "editor":
				entry.Author = value
			case "title":
				entry.Title = value
			case "year", "date":
				entry.Year = value
			case "journal", "journaltitle":
				entry.Journal = value
			case "booktitle":
				entry.Booktitle = value
			case "publisher":
				entry.Publisher = value
			case "pages":
				entry.Pages = value
			case "volume":
				entry.Volume = value
			case "number", "issue":
				entry.Number = value
			case "url", "doi":
				entry.Url = value
			case "note":
				entry.Note = value
			case "howpublished":
				entry.Howpublished = value
			}

			// Skip trailing whitespace and comma
			for i < n && isBibSpace(content[i]) {
				i++
			}
			if i < n && content[i] == ',' {
				i++
			}
		}

		if key != "" {
			entries = append(entries, entry)
		}
	}

	return entries
}

// cleanBibValue removes common LaTeX formatting from a BibTeX field value.
func cleanBibValue(v string) string {
	v = strings.ReplaceAll(v, "{", "")
	v = strings.ReplaceAll(v, "}", "")
	v = strings.ReplaceAll(v, `\&`, "&")
	v = strings.ReplaceAll(v, `\%`, "%")
	v = strings.ReplaceAll(v, `\$`, "$")
	v = strings.ReplaceAll(v, `\#`, "#")
	v = strings.ReplaceAll(v, "``", "\u201C")
	v = strings.ReplaceAll(v, "''", "\u201D")
	v = strings.ReplaceAll(v, "--", "\u2013")
	v = strings.ReplaceAll(v, "---", "\u2014")
	return strings.TrimSpace(v)
}

func isBibAlpha(c byte) bool {
	return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'
}

func isBibSpace(c byte) bool {
	return c == ' ' || c == '\t' || c == '\n' || c == '\r'
}
