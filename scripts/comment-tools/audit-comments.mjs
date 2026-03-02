#!/usr/bin/env node

/**
 * Comment Audit Tool
 * 
 * Analyzes all comments in the codebase and generates a deterministic report
 * showing what would be removed, compressed, or kept by comment cleanup.
 * 
 * Usage:
 *   npm run comments:audit
 *   node scripts/comment-tools/audit-comments.mjs
 * 
 * Output:
 *   - COMMENT_AUDIT_REPORT.md (human-readable report)
 *   - comment-audit-data.json (machine-readable data)
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, extname, relative } from 'path';
import { existsSync } from 'fs';

// File extensions to process
const extensions = ['.ts', '.tsx', '.vue', '.js', '.jsx'];

// Patterns to exclude
const excludePatterns = ['node_modules', 'dist', '.git', '.cursor', '.audit-reports'];

// Comment type detection
function detectCommentType(content) {
  const typePatterns = [
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

// Extract core insight from comment
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

// Check if comment is valuable (using same criteria as cleanup tool)
function isCommentValuable(comment, type) {
  const cleaned = extractCoreInsight(comment, type).toLowerCase();
  
  // Session/Phase notes are always removed (unless protected)
  if (type === 'SESSION' || type === 'PHASE') {
    return !shouldProtectComment(comment);
  }
  
  // Obvious patterns to remove
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
  
  // Valuable patterns
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

// Identify comment clusters
function identifyCommentClusters(lines) {
  const clusters = [];
  let currentCluster = null;
  let inMultiLineComment = false;
  let multiLineContent = '';
  let emptyLineCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed === '') {
      if (currentCluster) {
        emptyLineCount++;
        if (emptyLineCount <= 1) {
          currentCluster.endLine = i + 1;
          continue;
        }
      }
    } else {
      emptyLineCount = 0;
    }
    
    const isCommentLine = trimmed.startsWith('//') || 
                          trimmed.startsWith('/*') || 
                          trimmed.startsWith('*') || 
                          inMultiLineComment;
    
    if (trimmed.startsWith('/*') && !trimmed.includes('*/')) {
      inMultiLineComment = true;
      multiLineContent = line;
      
      if (!currentCluster) {
        currentCluster = {
          startLine: i + 1,
          endLine: i + 1,
          comments: [],
          lines: [],
        };
      } else {
        currentCluster.endLine = i + 1;
      }
      continue;
    }
    
    if (inMultiLineComment) {
      multiLineContent += '\n' + line;
      if (currentCluster) {
        currentCluster.endLine = i + 1;
      }
      
      if (trimmed.includes('*/')) {
        inMultiLineComment = false;
        if (currentCluster) {
          currentCluster.comments.push(multiLineContent);
          currentCluster.lines.push(i + 1);
        }
        multiLineContent = '';
      }
      continue;
    }
    
    if (isCommentLine && !inMultiLineComment) {
      if (!currentCluster) {
        currentCluster = {
          startLine: i + 1,
          endLine: i + 1,
          comments: [line],
          lines: [i + 1],
        };
      } else {
        currentCluster.endLine = i + 1;
        currentCluster.comments.push(line);
        currentCluster.lines.push(i + 1);
      }
    } else if (currentCluster && !isCommentLine && trimmed !== '') {
      // End of cluster
      if (currentCluster.comments.length >= 1) {
        clusters.push(currentCluster);
      }
      currentCluster = null;
      emptyLineCount = 0;
    }
  }
  
  if (currentCluster && currentCluster.comments.length >= 1) {
    clusters.push(currentCluster);
  }
  
  return clusters;
}

// Analyze a single file
async function analyzeFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const clusters = identifyCommentClusters(lines);
  
  const result = {
    path: relative(process.cwd(), filePath),
    totalComments: 0,
    commentsByType: {},
    willBeRemoved: [],
    willBeCompressed: [],
    willBeKept: [],
  };
  
  for (const cluster of clusters) {
    for (const comment of cluster.comments) {
      result.totalComments++;
      
      const type = detectCommentType(comment);
      result.commentsByType[type] = (result.commentsByType[type] || 0) + 1;
      
      const commentInfo = {
        line: cluster.startLine,
        type,
        content: comment.trim().substring(0, 100) + (comment.length > 100 ? '...' : ''),
      };
      
      // Determine fate of comment
      if (type === 'SESSION' || type === 'PHASE') {
        if (shouldProtectComment(comment)) {
          result.willBeKept.push({ ...commentInfo, reason: 'Protected (TODO/FIXME/Feature)' });
        } else {
          result.willBeRemoved.push({ ...commentInfo, reason: 'Session/Phase note' });
        }
      } else if (type === 'REGULAR') {
        if (isRegularCommentValuable(comment)) {
          result.willBeKept.push({ ...commentInfo, reason: 'Valuable insight' });
        } else {
          result.willBeRemoved.push({ ...commentInfo, reason: 'Obvious/redundant' });
        }
      } else {
        // Typed comment (WHY/PATTERN/etc.)
        if (isCommentValuable(comment, type)) {
          result.willBeKept.push({ ...commentInfo, reason: 'Valuable technical insight' });
        } else {
          result.willBeRemoved.push({ ...commentInfo, reason: 'Obvious action or vague reference' });
        }
      }
    }
    
    // Check if cluster would be compressed (3+ comments → fewer)
    if (cluster.comments.length >= 3) {
      const valuableCount = cluster.comments.filter(c => {
        const type = detectCommentType(c);
        return type !== 'REGULAR' ? isCommentValuable(c, type) : isRegularCommentValuable(c);
      }).length;
      
      if (valuableCount > 0 && valuableCount < cluster.comments.length) {
        result.willBeCompressed.push({
          lines: `${cluster.startLine}-${cluster.endLine}`,
          before: cluster.comments.length,
          after: Math.max(1, Math.ceil(valuableCount / 2)),
          preview: cluster.comments.slice(0, 2).map(c => c.trim().substring(0, 80)).join(' | '),
        });
      }
    }
  }
  
  return result;
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
console.log('🔍 Starting comment audit...\n');

const scanPaths = ['client', 'server'];
let allFiles = [];

for (const scanPath of scanPaths) {
  if (existsSync(scanPath)) {
    const files = await collectFiles(scanPath);
    allFiles.push(...files);
  }
}

console.log(`Found ${allFiles.length} files to analyze`);

const report = {
  summary: {
    totalFiles: allFiles.length,
    filesAnalyzed: 0,
    filesWithComments: 0,
    totalComments: 0,
    commentsByType: {},
    willBeRemoved: 0,
    willBeCompressed: 0,
    willBeKept: 0,
  },
  fileDetails: [],
  examples: {
    removed: [],
    compressed: [],
    kept: [],
  },
};

let filesProcessed = 0;
for (const filePath of allFiles) {
  try {
    const fileResult = await analyzeFile(filePath);
    report.summary.filesAnalyzed++;
    filesProcessed++;
    
    if (fileResult.totalComments > 0) {
      report.summary.filesWithComments++;
      report.summary.totalComments += fileResult.totalComments;
      
      for (const [type, count] of Object.entries(fileResult.commentsByType)) {
        report.summary.commentsByType[type] = (report.summary.commentsByType[type] || 0) + count;
      }
      
      report.summary.willBeRemoved += fileResult.willBeRemoved.length;
      report.summary.willBeCompressed += fileResult.willBeCompressed.length;
      report.summary.willBeKept += fileResult.willBeKept.length;
      
      report.fileDetails.push({
        path: fileResult.path,
        totalComments: fileResult.totalComments,
        commentsByType: fileResult.commentsByType,
        actions: {
          remove: fileResult.willBeRemoved.length,
          compress: fileResult.willBeCompressed.length,
          keep: fileResult.willBeKept.length,
        },
      });
      
      if (report.examples.removed.length < 10) {
        for (const comment of fileResult.willBeRemoved.slice(0, 10 - report.examples.removed.length)) {
          report.examples.removed.push({ file: fileResult.path, ...comment });
        }
      }
      
      if (report.examples.compressed.length < 10) {
        for (const cluster of fileResult.willBeCompressed.slice(0, 10 - report.examples.compressed.length)) {
          report.examples.compressed.push({ file: fileResult.path, ...cluster });
        }
      }
      
      if (report.examples.kept.length < 10) {
        for (const comment of fileResult.willBeKept.slice(0, 10 - report.examples.kept.length)) {
          report.examples.kept.push({ file: fileResult.path, ...comment });
        }
      }
    }
    
    if (filesProcessed % 100 === 0) {
      console.log(`  Analyzed ${filesProcessed}/${allFiles.length} files...`);
    }
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
  }
}

console.log(`\n✅ Analysis complete!\n`);

// Generate report
const reportText = `
# Comment Audit Report
Generated: ${new Date().toISOString()}

## Summary

**Files Scanned:** ${report.summary.totalFiles}
**Files with Comments:** ${report.summary.filesWithComments}
**Total Comments Found:** ${report.summary.totalComments}

### Comments by Type
${Object.entries(report.summary.commentsByType)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

### Cleanup Actions
- **Will be REMOVED:** ${report.summary.willBeRemoved} comments (${Math.round(report.summary.willBeRemoved / report.summary.totalComments * 100)}%)
- **Will be COMPRESSED:** ${report.summary.willBeCompressed} clusters
- **Will be KEPT:** ${report.summary.willBeKept} comments (${Math.round(report.summary.willBeKept / report.summary.totalComments * 100)}%)

---

## Examples of Comments to be REMOVED

${report.examples.removed.slice(0, 10).map((ex, i) => `
### ${i + 1}. ${ex.file}:${ex.line}
**Type:** ${ex.type}
**Reason:** ${ex.reason}
**Content:** ${ex.content}
`).join('\n')}

---

## Examples of Clusters to be COMPRESSED

${report.examples.compressed.slice(0, 5).map((ex, i) => `
### ${i + 1}. ${ex.file}:${ex.lines}
**Before:** ${ex.before} comments
**After:** ~${ex.after} comments (estimated)
**Preview:** ${ex.preview}
`).join('\n')}

---

## Examples of Comments to be KEPT

${report.examples.kept.slice(0, 10).map((ex, i) => `
### ${i + 1}. ${ex.file}:${ex.line}
**Type:** ${ex.type}
**Reason:** ${ex.reason}
**Content:** ${ex.content}
`).join('\n')}

---

## Files with Most Comments to Remove

${report.fileDetails
  .filter(f => f.actions.remove > 0)
  .sort((a, b) => b.actions.remove - a.actions.remove)
  .slice(0, 20)
  .map((f, i) => `${i + 1}. ${f.path}: ${f.actions.remove} comments`)
  .join('\n')}

---

## Detailed File Breakdown

${report.fileDetails
  .filter(f => f.totalComments > 5)
  .sort((a, b) => b.totalComments - a.totalComments)
  .slice(0, 30)
  .map(f => `
### ${f.path}
- Total Comments: ${f.totalComments}
- Types: ${Object.entries(f.commentsByType).map(([t, c]) => `${t}=${c}`).join(', ')}
- Actions: Remove=${f.actions.remove}, Compress=${f.actions.compress}, Keep=${f.actions.keep}
`).join('\n')}
`;

await writeFile('COMMENT_AUDIT_REPORT.md', reportText, 'utf-8');
await writeFile('comment-audit-data.json', JSON.stringify(report, null, 2), 'utf-8');

console.log(`📄 Report saved to: COMMENT_AUDIT_REPORT.md`);
console.log(`📊 Data saved to: comment-audit-data.json`);
console.log(`\n${'='.repeat(60)}`);
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`Total Comments: ${report.summary.totalComments}`);
console.log(`  → Will be REMOVED: ${report.summary.willBeRemoved} (${Math.round(report.summary.willBeRemoved / report.summary.totalComments * 100)}%)`);
console.log(`  → Will be COMPRESSED: ${report.summary.willBeCompressed} clusters`);
console.log(`  → Will be KEPT: ${report.summary.willBeKept} (${Math.round(report.summary.willBeKept / report.summary.totalComments * 100)}%)`);
console.log(`\nTop comment types:`);
Object.entries(report.summary.commentsByType)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .forEach(([type, count]) => console.log(`  - ${type}: ${count}`));
console.log(`\nSee COMMENT_AUDIT_REPORT.md for detailed analysis.`);
