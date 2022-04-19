# The HL7 Message Manager

Table of contents

1. [Current Issues](#current-issues)
2. [What I Will Do](#what-i-will-do)
3. [Search Modes](#search-modes)
4. [File Structures](#file-structures)
5. [Models](#models)
   1. [Directory](#directory)
   2. [Messages](#messages)

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
