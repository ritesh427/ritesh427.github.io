# Script to generate comprehensive questions for all missing curriculum topics
import os, sys, json

BANKS_DIR = '/Users/ritesh/Developer/experiments/ritesh427.github.io/js/bank'

# 1. Cloud, AWS & Spring AI
cloud_ai_code = '''\'use strict\';
/* =========================================================
   DevPath Question Bank: Git, AWS Cloud & Spring AI
   ========================================================= */

// git1: Git Mastery
QB.add("git1", [
  {
    q: "How does 'git rebase' differ fundamentally from 'git merge' when incorporating upstream changes into a feature branch?",
    o: [
      "Rebase replays local commits on top of the upstream base to produce a clean linear commit history; merge creates a 2-parent merge commit preserving exact branch chronology",
      "Rebase deletes all commit messages permanently",
      "Merge only works with local repositories and cannot push to GitHub",
      "Rebase automatically resolves all merge conflicts without human input"
    ],
    a: 0,
    e: "git rebase unwinds your feature branch commits, updates the base to the latest upstream commit, and replays each feature commit one by one. This keeps git log linear without cluttering history with merge commits."
  },
  {
    q: "If an engineer accidentally executes 'git reset --hard HEAD~3' and loses 3 unpushed commits, how can they recover those commits?",
    o: [
      "Run 'git reflog' to find the SHA of the commit prior to the reset, then run 'git reset --hard <SHA>' or 'git cherry-pick <SHA>'",
      "It is impossible; git reset --hard permanently purges data from the disk immediately",
      "By cloning the remote repository again",
      "By restarting the terminal"
    ],
    a: 0,
    e: "Git maintains a Reference Log (reflog) of every time HEAD moves. Orphaned commits remain in the Git object database until garbage collection (git gc, usually 30 days), allowing trivial recovery via reflog."
  },
  {
    q: "What is the purpose of 'git cherry-pick' in a multi-branch workflow?",
    o: [
      "To selectively apply the changes introduced by a specific existing commit from another branch onto the current working branch",
      "To delete all untracked files in the working directory",
      "To compare the performance of two branches",
      "To create a shallow clone of a large repository"
    ],
    a: 0,
    e: "Cherry-pick is commonly used for hotfixing: picking a critical bugfix commit from a development branch and applying it directly onto a production release branch without merging unready feature code."
  }
]);

// aws1: AWS Cloud Architecture
QB.add("aws1", [
  {
    q: "What data consistency model does Amazon S3 offer for PUT and DELETE requests of objects across all regions?",
    o: [
      "Strong read-after-write consistency for PUTs and DELETEs of objects in all buckets",
      "Eventual consistency with a guaranteed 15-minute lag",
      "Weak consistency where reads only succeed after 5 minutes",
      "Strong consistency for PUTs, but eventual consistency for DELETEs"
    ],
    a: 0,
    e: "Since December 2020, Amazon S3 provides strong read-after-write consistency for PUT and DELETE requests of objects in all AWS regions with no change to performance or latency."
  },
  {
    q: "In Amazon SQS, what is the 'Visibility Timeout' mechanism?",
    o: [
      "The duration during which SQS prevents other consumers from receiving and processing a message that has already been retrieved by one consumer",
      "The time a message remains stored in SQS before being permanently deleted",
      "The latency between sending a message and it becoming readable",
      "The timeout before SQS scales down consumer EC2 instances"
    ],
    a: 0,
    e: "When a consumer receives a message, the visibility timeout starts (default 30s). If the consumer processes and deletes the message, it is gone. If the consumer crashes, the timeout expires and another consumer can process it."
  },
  {
    q: "How does DynamoDB distribute read and write throughput across physical storage partitions?",
    o: [
      "DynamoDB hashes the Partition Key (PK) attribute to determine the physical partition that stores the item",
      "It stores all items in a single MySQL table",
      "Items are round-robined randomly across all partitions",
      "It uses consistent hashing based on the item's creation timestamp"
    ],
    a: 0,
    e: "DynamoDB uses the partition key as input to an internal hash function. Designing a high-cardinality partition key (e.g. userId, orderId) avoids 'hot partitions' and evenly balances I/O across partitions."
  }
]);

// ai1: Spring AI & Generative AI Engineering
QB.add("ai1", [
  {
    q: "In Spring AI, what is the role of the VectorStore abstraction?",
    o: [
      "To store, index, and query text embeddings using vector similarity algorithms (e.g. Cosine, Euclidean) for Retrieval-Augmented Generation (RAG)",
      "To compress high-resolution PNG images for web delivery",
      "To execute matrix multiplication on local CPUs",
      "To serialize Java objects to binary JSON"
    ],
    a: 0,
    e: "VectorStore (supporting PGvector, Milvus, Chroma, Pinecone, Redis) stores vector embeddings generated from documents. It performs similarity searches to retrieve context relevant to user prompts before sending them to LLMs."
  },
  {
    q: "How does 'Function Calling' (Tool Calling) work in Spring AI with models like GPT-4 or Claude?",
    o: [
      "The developer registers a Java @Bean implementing Function<Request, Response>; the model decides when to invoke it based on the user's prompt and receives the function output to formulate its final answer",
      "The model downloads and compiles the raw Java bytecode inside its neural network",
      "The user must write Python scripts inside the prompt",
      "The model makes direct unrestricted calls to the client database"
    ],
    a: 0,
    e: "Spring AI lets you define standard Java functions (e.g. getWeather(city), queryOrder(id)). The LLM identifies that it needs external data, generates JSON arguments, Spring AI executes your Java function locally, and passes the result back to the LLM."
  },
  {
    q: "What is the core problem addressed by Retrieval-Augmented Generation (RAG) in enterprise AI applications?",
    o: [
      "LLM hallucinations and lack of domain-specific/private enterprise data without requiring expensive and slow model fine-tuning",
      "Reducing GPU power consumption by 90%",
      "Eliminating the need for internet access",
      "Replacing relational databases with raw text files"
    ],
    a: 0,
    e: "Pre-trained models don't know private enterprise data and can hallucinate. RAG searches private knowledge bases for relevant snippets and injects them into the prompt as verified context for accurate answers."
  }
]);
'''

with open(os.path.join(BANKS_DIR, 'bank_cloud_ai.js'), 'w', encoding='utf-8') as f:
    f.write(cloud_ai_code)

print('Generated bank_cloud_ai.js')
