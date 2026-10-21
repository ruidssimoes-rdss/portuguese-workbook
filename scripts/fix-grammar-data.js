#!/usr/bin/env node

/**
 * Fix grammar.json data issues:
 * 1. Rename `correct` to `correctIndex` in sentence-structure topic
 * 2. Add `correctAnswer` field based on options[correctIndex]
 * 3. Validate all 48 topics
 */

const fs = require('fs');
const path = require('path');

const GRAMMAR_FILE = path.join(__dirname, '../src/data/grammar.json');

function main() {
  console.log('Reading grammar.json...');
  const data = JSON.parse(fs.readFileSync(GRAMMAR_FILE, 'utf8'));
  
  let fixed = 0;
  let validated = 0;
  let errors = [];
  
  Object.entries(data.topics).forEach(([topicId, topic]) => {
    if (!topic.questions) return;
    
    topic.questions.forEach((question, qIndex) => {
      // Fix: rename `correct` to `correctIndex`
      if ('correct' in question && !('correctIndex' in question)) {
        question.correctIndex = question.correct;
        delete question.correct;
        fixed++;
      }
      
      // Ensure correctAnswer matches options[correctIndex]
      if (typeof question.correctIndex !== 'number') {
        errors.push(`${topicId} question ${qIndex}: missing correctIndex`);
        return;
      }
      
      if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
        errors.push(`${topicId} question ${qIndex}: correctIndex ${question.correctIndex} out of range [0, ${question.options.length})`);
        return;
      }
      
      const expectedAnswer = question.options[question.correctIndex];
      if (question.correctAnswer !== expectedAnswer) {
        question.correctAnswer = expectedAnswer;
        fixed++;
      }
      
      validated++;
    });
  });
  
  console.log(`\nFixed ${fixed} field(s)`);
  console.log(`Validated ${validated} questions across ${Object.keys(data.topics).length} topics`);
  
  if (errors.length > 0) {
    console.error('\n⚠️  Validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
  
  // Write the fixed data back
  console.log('\nWriting fixed data...');
  fs.writeFileSync(GRAMMAR_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('✓ Done!');
}

main();
