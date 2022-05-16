# The HL7 Message Manager

Table of contents

- [The HL7 Message Manager](#the-hl7-message-manager)
  - [Current Issues](#current-issues)
  - [What I Will Do](#what-i-will-do)
  - [Search Modes](#search-modes)
  - [File Structures](#file-structures)
  - [Models](#models)
    - [Directory](#directory)
    - [Messages](#messages)
- [Search use cases](#search-use-cases)
  - [search with 0 filters](#search-with-0-filters)
  - [filter search (inside a directory)](#filter-search-inside-a-directory)

This application is designed to create a simple and organised way to keep track of your hl7 messages.

---

## Current Issues

Keeping track of your messages in notepad or notepad++? So was I. This ends up being an absolute mess when you have 50+ messages in a single file. Wander which message you needed to test a certain script change? ever wandered which messages you used to check if an interface works correctly? So was I.

---

## What I Will Do

- create a searchable hl7 message directory
  - organise based on
    - domain
    - script
    - message string itself
  - ability to add messages to certain directories
  - ability to remove messages

---

## Search Modes

- default will search through EVERYTHING to find your message
  - use search term to search script
  - use search term to search comservers
  - use search term to search messages
  - using a trie to do partial matching
- add a filter type search
  - add optional filters to limit your search more
    - add filter type for
      - script
      - comserver
      - message
  - messages will be searched in a combination of your chosen filter IF your filters are selected

---

## File Structures

R = recursive, U = unit

- directory (R)
  - messages (U)

---

## Models

### Directory

- Directory (nullable)
- list of messages: List\<Message\> (nullable)

### Messages

- script: String
- comserver: String
- raw_message: String


---

# Search use cases
All searches will return a list of messages that contain the following information in almost inforgaphic sense
  1. description at top
  2. comserver + scripts this message was used for
  3. Raw message to the left
  4. and the directory path from root where this message is stored
  5. copy button which will copy the message straight to your clipboard
  6. diff button which will open a diff tool to allow you to differentiate with another message <- using jsdiff>

---
## search with 0 filters
This is considered a global search. any terms entered into the search bar will be used to match on ALL messages accross all directories. This is the broadest search and will be the slowest search too.
To perform this search simply try to put keywords, and through the use of flexsearch library, all features will be searched to do this.

---

## filter search (inside a directory)
using a similair stratergy to the above 