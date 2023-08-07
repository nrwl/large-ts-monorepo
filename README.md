# 🔥🔥🔥 Nx+TypeScript Benchmark (Batch Mode = Project Refs + Incremental Builds) 🏎️🏎️🏎️

![benchmark](./assets/ts-benchmark.gif)

This repo compares two modes of running the `@nx/js:tsc` executor: the regular one and the batch one. The batch implementation, apart from running multiple tasks in a single process, also creates the required [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) on the fly to perform incremental builds.


## Benchmark results (2023-07-31, Nx v16.6.0)

**TLDR: Depending onthe operation, the batch mode is from 1.16 to 7.73 time faster.**

All commands in the benchmarks are run with the default number of parallel processes (3). In the case of the batch implementation, it runs in a single process because all the tasks using the same executor are batched together.

All benchmarks were run on a machine with the following specs:

```
MacBook Pro (16-inch, 2019)
macOS Ventura 13.4.1
2.4 GHz 8-Core Intel Core i9
64 GB 2667 MHz DDR4
SSD 1TB
```

### Scenario 1 (10 packages):

A root package that depends on 3 other packages, each of which depends on 2 other packages. Each package has 22 TypeScript files. This results in a project graph with 10 packages and 220 TypeScript files.

Command: `pnpm benchmark:small`

- Cold build: `@nx/js:tsc` batch implementation is **~1.58x faster** than non-batch implementation
- 1 affected packages (~10%): `@nx/js:tsc` batch implementation is **~1.16x faster** than non-batch implementation
- 2 affected packages (~20%): `@nx/js:tsc` batch implementation is **~1.84x faster** than non-batch implementation
- 5 affected packages (~50%): `@nx/js:tsc` batch implementation is **~2.71x faster** than non-batch implementation
- 1 leaf dependency affected: `@nx/js:tsc` batch implementation is **~2.59x faster** than non-batch implementation

### Scenario 2 (50 packages):

A root package that depends on 7 other packages, each of which depends on 6 other packages. Each package has 22 TypeScript files. This results in a project graph with 50 packages and 1100 TypeScript files.

Command: `pnpm benchmark:medium`

- Cold build: `@nx/js:tsc` batch implementation is **~2.83x faster** than non-batch implementation
- 5 affected packages (~10%): `@nx/js:tsc` batch implementation is **~2.45x faster** than non-batch implementation
- 10 affected packages (~20%): `@nx/js:tsc` batch implementation is **~2.63x faster** than non-batch implementation
- 25 affected packages (~50%): `@nx/js:tsc` batch implementation is **~4.71x faster** than non-batch implementation
- 1 leaf dependency affected: `@nx/js:tsc` batch implementation is **~2.39x faster** than non-batch implementation

### Scenario 3 (253 packages):

A root package that depends on 12 other packages, each of which depends on 20 other packages. Each package has 22 TypeScript files. This results in a project graph with 253 packages and 5566 TypeScript files.

Command: `pnpm benchmark:large`

- Cold build: `@nx/js:tsc` batch implementation is **~4.22x faster** than non-batch implementation
- 25 affected packages (~10%): `@nx/js:tsc` batch implementation is **~2.77x faster** than non-batch implementation
- 51 affected packages (~20%): `@nx/js:tsc` batch implementation is **~4.39x faster** than non-batch implementation
- 127 affected packages (~50%): `@nx/js:tsc` batch implementation is **~7.73x faster** than non-batch implementation
- 1 leaf dependency affected: `@nx/js:tsc` batch implementation is **~1.56x faster** than non-batch implementation

### Scenario 4 (63 packages, deeply nested dependencies):

A root package with dependencies up to 5 levels deep. Packages in each level depend on 2 other packages. Each package has 22 TypeScript files. This results in a project graph with 63 packages and 1386 TypeScript files.

Command: `pnpm benchmark:nested`

- Cold build: `@nx/js:tsc` batch implementation is **~2.88x faster** than non-batch implementation
- 6 affected packages (~10%): `@nx/js:tsc` batch implementation is **~1.49x faster** than non-batch implementation
- 13 affected packages (~21%): `@nx/js:tsc` batch implementation is **~1.72x faster** than non-batch implementation
- 32 affected packages (~51%): `@nx/js:tsc` batch implementation is **~1.81x faster** than non-batch implementation
- 1 leaf dependency affected: `@nx/js:tsc` batch implementation is **~2.47x faster** than non-batch implementation



## Notes

The non-batch implementation of the `@nx/js:tsc` executor is the default implementation run by Nx. The batch implementation is an experimental implementation that can be enabled by setting the `NX_BATCH_MODE=true` environment variable.

### Why is the batch implementation faster?

The non-batch implementation runs each task in a separate process. Each process creates a new `ts.Program` instance and performs a full build. Creating a full `ts.Program` instance is an expensive operation. Creating processes and `ts.Program` comes with a lot of overhead. Thanks to the project graph, this is already improved by orchestrating tasks and running them in parallel. Still, there's only so much that can be run in parallel and the more deeply nested the dependencies are, the less parallelism we can achieve.

The batch implementation runs multiple tasks in a single process. This reduces the overhead of starting a new process for each task. It also creates the required [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) (based on the project graph information) on the fly to perform [incremental builds](https://www.typescriptlang.org/docs/handbook/project-references.html#build-mode-for-typescript). This is what yields the main performance benefits over the non-batch implementation. In this mode, the TypeScript compiler doesn't create a full `ts.Program` per project. Instead, it acts more like a build orchestrator and runs only out-of-date projects in the correct order.

### Compatible with Nx caching and distributed task execution 🏎️

TSC has powerful capabilities for incremental builds. Nx has powerful capabilities for caching and task distribution. These features compose very nicely. First Nx will retreive whatever it can from its local and remote caches (which includes `.tsbuildinfo` files), and then TSC will compile the remaining libs using the cached `.tsbuildinfo` files. This results in the minimum amount of computation.

Note even though the batch implementation can compile hundreds of libraries in the same process, each compiled library will be cached separately by Nx, which greatly increase computation reuse and the percentage of cache hits.

### Performance and DX balance

In large monorepos, it can be challenging to maintain Project references required for TSC incremental builds. Developers need to manually keep those references up to date, which is error-prone and can lead to broken builds.

The `@nx/js:tsc` batch implementation addresses this by creating the required project references on the fly using the project graph information. Nx already knows how your projects relate, so no need to tell it again. This eliminates the need for developers to manually maintain the project references while still getting the performance benefits of incremental builds. Zero DX cost, huge perf benefits. 