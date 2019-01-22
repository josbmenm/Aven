/**
 * As a concept, domains in Aven Cloud exist to support any kind of multi-tennancy. Generally domains in Aven Cloud will correspond to real domain names and subdomains, but they don't need to.
 *
 * Most often, different domains will have different resource limits: max block capacity, throttling, or other limitations. Logging, authentication, and monitoring should be implemented on a per-domain basis.
 *
 * Not everything in Aven Cloud needs to be independent between domains. Blocks in particular should be shared, because they are immutable and identified by (a checksum of) their content. Ideally, Aven Cloud implementations will share storage of blocks across domains, and allow each domain to monitor and administrate its own consumption.
 */
