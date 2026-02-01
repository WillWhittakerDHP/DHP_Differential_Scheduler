#!/usr/bin/env node

/**
 * Comment Cleanup Script
 * 
 * Removes obvious/redundant comments and compresses verbose clusters.
 * Run audit-comments.mjs first to see what will be removed.
 * 
 * Usage:
 *   npm run comments:cleanup
 *   node scripts/comment-tools/cleanup-comments.mjs
 * 
 * What gets removed:
 *   - Session/Phase notes (Session X.Y.Z, Phase X.Y)
 *   - Obvious actions ("gets", "loads", "saves")
 *   - Generic verbs ("ensures", "provides", "handles")
 *   - Vague references ("this function", "the value")
 * 
 * What gets kept:
 *   - Technical insights with specific details
 *   - Architecture decisions
 *   - Workarounds, edge cases, performance notes
 *   - TODO/FIXME/Feature references
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, extname, relative } from 'path';
import { existsSync } from 'fs';

// File extensions to process
const extensions = ['.ts', '.tsx', '.vue', '.js', '.jsx'];

// Patterns to exclude
const excludePatterns = ['node_modules', 'dist', '.git', '.cursor', '.audit-reports', 'auto-imports.d.ts'];

// Comment type detection
function detectCommentType(content) {
  const typePatterns = [
    { type: 'LEARNING', pattern: /(?:\/\/|\/\*\*?|\*)\s*LEARNING:/i },
    { type: 'WHY', pattern: /(?:\/\/|\/\*\*?|\*)\s*WHY:/i },
    { type: 'COMPARISON', pattern: /(?:\/\/|\/\*\*?|\*)\s*COMPARISON:/i },
    { type: 'PATTERN', pattern: /(?:\/\/|\/\*\*?|\*)\s*PATTERN:/i },
    { type: 'RESOURCE', pattern: /(?:\/\/|\/\*\*?|\*)\s*RESOURCE:/i },
    { type: 'REFERENCE', pattern: /(?:\/\/|\/\*\*?|\*)\s*REFERENCE:/i },
    { type: 'SESSION', pattern: /(?:\/\/|\/\*\*?|\*)\s*Session\s+\d+\.\d+\.\d+:/i },
    { type: 'PHASE', pattern: /(?:\/\/|\/\*\*?|\*)\s*Phase\s+\d+\.\d+:/i },
  ];
  
  for (const { type, pattern } of typePatterns) {
    if (pattern.test(content)) {
      return type;
    }
  }
  
  return 'REGULAR';
}

// Extract core insight
function extractCoreInsight(comment, type) {
  let cleaned = comment
    .replace(/^\/\*\*?|\*\/$/g, '')
    .replace(/^\s*\*\s?/gm, '')
    .replace(/^\/\/\s*/gm, '')
    .replace(/^<!--\s*|\s*-->$/g, '')
    .trim();
  
  const typePattern = new RegExp(`^${type}:\\s*`, 'i');
  cleaned = cleaned.replace(typePattern, '').trim();
  
  return cleaned;
}

// Check if comment is valuable
function isCommentValuable(comment, type) {
  const cleaned = extractCoreInsight(comment, type).toLowerCase();
  
  if (type === 'SESSION' || type === 'PHASE') {
    return !shouldProtectComment(comment);
  }
  
  const obviousPatterns = [
    /^(gets?|fetches?|loads?|saves?|sends?|returns?|creates?|updates?|deletes?)/,
    /^(ensures?|provides?|handles?|manages?)/,
    /^(for|to|when|if|because|so that)/,
    /^(always|never|must|should)\s+(include|use|call|set)/,
    /^(this|it|the)\s+(function|method|code|value)/,
    /^use\s+(composable|function|pattern|api)/,
    /^(injects?|syncs?|assigns?|extracts?)\s+/,
  ];
  
  if (obviousPatterns.some(pattern => pattern.test(cleaned))) {
    return false;
  }
  
  const valuablePatterns = [
    /\b(converts?|transforms?|extracts?|parses?|validates?)\s+\w+\s+(to|from|into)/,
    /\b(prevents?|avoids?|ensures?)\s+\w+\s+(bugs?|errors?|issues?|problems?)/,
    /\b(because|since|due to|as)\s+\w+/,
    /\b(pattern|approach|strategy|architecture)/,
    /\b(reactivity|dependency|tracking|state|lifecycle)/,
    /\b(rfc3339|rfc|iso|utc|timezone|format)/,
    /\b(composable|hook|middleware|transformer|validator)/,
  ];
  
  const hasValuablePattern = valuablePatterns.some(pattern => pattern.test(cleaned));
  const isSubstantial = cleaned.length > 20;
  
  return hasValuablePattern && isSubstantial;
}

// Check if regular comment is valuable
function isRegularCommentValuable(comment) {
  let cleaned = comment
    .replace(/^\/\*\*?|\*\/$/g, '')
    .replace(/^\s*\*\s?/gm, '')
    .replace(/^\/\/\s*/gm, '')
    .replace(/^<!--\s*|\s*-->$/g, '')
    .trim()
    .toLowerCase();
  
  if (cleaned.length < 15) {
    return false;
  }
  
  const obviousPatterns = [
    /^(gets?|fetches?|loads?|saves?|sends?|returns?|creates?|updates?|deletes?|sets?|initializes?)/,
    /^(this|it|the)\s+(function|method|code|value|variable|constant|object|array)/,
    /^(calculates?|computes?|processes?|handles?|manages?|provides?|ensures?)/,
    /^(for|to|when|if|because|so that|in order to)/,
    /^(always|never|must|should|will|can)\s+(be|have|do|use|call|set|get|return)/,
  ];
  
  if (obviousPatterns.some(pattern => pattern.test(cleaned))) {
    return false;
  }
  
  const valuablePatterns = [
    /\b(workaround|hack|temporary|fix|issue|bug|edge\s+case|corner\s+case)/,
    /\b(performance|optimization|memory|speed|efficiency)/,
    /\b(race\s+condition|concurrency|thread|async|promise|callback)/,
    /\b(deprecated|legacy|old|backward\s+compatibility|migration)/,
    /\b(security|vulnerability|sanitize|escape|validate|authorize)/,
    /\b(limitation|constraint|restriction|cannot|unable|not\s+supported)/,
    /\b(why|reason|rationale|because|since|due\s+to)/,
  ];
  
  const hasValuablePattern = valuablePatterns.some(pattern => pattern.test(cleaned));
  const isSubstantial = cleaned.length > 25;
  
  return hasValuablePattern && isSubstantial;
}

// Check if comment should be protected
function shouldProtectComment(content) {
  const protectionPatterns = [
    /\bTODO\b/i,
    /\bFIXME\b/i,
    /\bNOTE:\s/i,
    /Feature\s+\d+/i,
    /\bfuture\s+work\b/i,
    /\bfuture\s+use\b/i,
    /\bfuture\s+feature\b/i,
    /\bplugin\b/i,
    /\bplug-in\b/i,
    /\bextension\s+point\b/i,
  ];
  
  return protectionPatterns.some(pattern => pattern.test(content));
}

// Process a single file
async function processFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let modified = false;
  let commentsRemoved = 0;
  const newLines = [];
  
  let inMultiLineComment = false;
  let multiLineContent = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Multi-line comment handling
    if (line.includes('/*') && !line.includes('*/')) {
      inMultiLineComment = true;
      multiLineContent = line;
      continue;
    }
    
    if (inMultiLineComment) {
      multiLineContent += '\n' + line;
      
      if (line.includes('*/')) {
        inMultiLineComment = false;
        
        const type = detectCommentType(multiLineContent);
        
        if (type === 'SESSION' || type === 'PHASE') {
          if (shouldProtectComment(multiLineContent)) {
            newLines.push(...multiLineContent.split('\n'));
          } else {
            modified = true;
            commentsRemoved++;
          }
        } else if (type === 'REGULAR') {
          if (isRegularCommentValuable(multiLineContent)) {
            newLines.push(...multiLineContent.split('\n'));
          } else {
            modified = true;
            commentsRemoved++;
          }
        } else {
          if (isCommentValuable(multiLineContent, type)) {
            newLines.push(...multiLineContent.split('\n'));
          } else {
            modified = true;
            commentsRemoved++;
          }
        }
        
        multiLineContent = '';
        continue;
      }
      continue;
    }
    
    // Single-line comment handling
    if (trimmed.startsWith('//')) {
      const type = detectCommentType(line);
      
      if (type === 'SESSION' || type === 'PHASE') {
        if (shouldProtectComment(line)) {
          newLines.push(line);
        } else {
          modified = true;
          commentsRemoved++;
        }
        continue;
      } else if (type === 'REGULAR') {
        if (isRegularCommentValuable(line)) {
          newLines.push(line);
        } else {
          modified = true;
          commentsRemoved++;
        }
        continue;
      } else {
        if (isCommentValuable(line, type)) {
          newLines.push(line);
        } else {
          modified = true;
          commentsRemoved++;
        }
        continue;
      }
    }
    
    // JSDoc line
    if (trimmed.startsWith('*') && !trimmed.startsWith('*/')) {
      const type = detectCommentType(line);
      
      if (type === 'SESSION' || type === 'PHASE') {
        if (shouldProtectComment(line)) {
          newLines.push(line);
        } else {
          modified = true;
          commentsRemoved++;
        }
        continue;
      } else if (type !== 'REGULAR') {
        if (isCommentValuable(line, type)) {
          newLines.push(line);
        } else {
          modified = true;
          commentsRemoved++;
        }
        continue;
      }
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    await writeFile(filePath, newLines.join('\n'), 'utf-8');
  }
  
  return { modified, commentsRemoved };
}

// Recursively collect files
async function collectFiles(dir, files = []) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(process.cwd(), fullPath);
      
      if (excludePatterns.some(pattern => relativePath.includes(pattern))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await collectFiles(fullPath, files);
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  } catch (error) {
    return files;
  }
}

// Main execution
console.log('🧹 Starting comment cleanup...\n');

const scanPaths = ['client', 'server'];
let allFiles = [];

for (const scanPath of scanPaths) {
  if (existsSync(scanPath)) {
    const files = await collectFiles(scanPath);
    allFiles.push(...files);
  }
}

console.log(`Found ${allFiles.length} files to process`);

let filesModified = 0;
let totalCommentsRemoved = 0;
let filesProcessed = 0;

for (const filePath of allFiles) {
  try {
    const result = await processFile(filePath);
    filesProcessed++;
    
    if (result.modified) {
      filesModified++;
      totalCommentsRemoved += result.commentsRemoved;
      console.log(`✓ ${relative(process.cwd(), filePath)} - ${result.commentsRemoved} comment(s) removed`);
    }
    
    if (filesProcessed % 100 === 0) {
      console.log(`  Progress: ${filesProcessed}/${allFiles.length} files processed...`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('CLEANUP COMPLETE');
console.log('='.repeat(60));
console.log(`Files processed: ${filesProcessed}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Comments removed: ${totalCommentsRemoved}`);
console.log(`\n✅ Cleanup complete! Your codebase is now cleaner.`);
