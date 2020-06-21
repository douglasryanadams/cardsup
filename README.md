# Welcome

Cardsup is a scrum-poker project built on NodeJS, JavaScript, HTML5, and CSS.

A primary design goal is to rely on as few libraries and dependencies as possible, this keeps the codebase easy to read and easy to change. There are no exceptional requirements for a single instance scrum-poker site that would require additional complexity.

# Codebase

- `/app` contains the NodeJS code for running the WebSocket server, it includes unit and cucumber tests
- `/web` contains HTML, Javascript, CSS, and other static files for serving the front end
- `/docker` contains files for building an Nginx Docker container for hosting the application [currently incomplete]

# Personal Motivations


## Rust

This began as a persona project to teach myself more about the Rust language and you'll see early commits that include Rust code for the 'app' portion of the project. I learned a lot about Rust and a lot about the complexities of sharing memory across multiple threads and objects in Rust. Ultimately I decided that:

1. Rust was not the right technology for this project (which I suspected going in) and made implementation way more complicated than other languages with more forgiving memory management features
2. To get Rust to work for the web server would have sacrificed most of what's nice about the language because a lot of objects would need to ignore/work around the "ownership" concept
3. Rust is awesome and I look forward to using it for a future project with better suited requirements.

## Web

I didn't want to use any frameworks for the web app because I've used a few at work (VueJS w/ TypeScript and SASS) and sometimes I feel like they're overkill for simple cases. They're each a layer of abstraction from the documentation and native features of the browser.

Since this is a hobby/passion project I wanted to take this opportunity to get more familiar with all the features built in to JavaScript, HTML, and CSS these days.

