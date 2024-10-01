Here are the benchmarks for building projects with and without project references.

The benchmarks are split into four groups:

1. No file changes (warm cache).
2. Modify root project (e.g. `large-pkg1`).
3. Modify middle projects (e.g. `large-pkg1-{1,2,...,12}`)
4. Modify leaf projects (e.g. `large-pkg1-{1,2,...,12}-{1,2,...,20}`)

You'll need [hyperfine](https://github.com/sharkdp/hyperfine) to run these benchmarks.

The results show up to 3x speedup when using project references, depending on the number of affected projects.

## No file changes

```shell
hyperfine \
-n "Without project reference (no changes)" "nx build large-pkg1 --configuration=old --skip-nx-cache" \
-n "With project reference (no changes)" "nx build large-pkg1 --skip-nx-cache"
```

Results:

```
hyperfine --max-runs 3 \
    -n "Without project reference (no changes)" "nx build large-pkg1 --configuration=old --skip-nx-cache" \
    -n "With project reference (no changes)" "nx build large-pkg1 --skip-nx-cache"
Benchmark 1: Without project reference (no changes)
  Time (mean ± σ):     38.693 s ±  0.584 s    [User: 224.998 s, System: 12.252 s]
  Range (min … max):   38.201 s … 39.339 s    10 runs

Benchmark 2: With project reference (no changes)
  Time (mean ± σ):     11.794 s ±  0.003 s    [User: 29.597 s, System: 3.505 s]
  Range (min … max):   11.791 s … 11.797 s    10 runs

Summary
  With project reference (no changes) ran
    3.28 ± 0.05 times faster than Without project reference (no changes)
```

## Update root project

```shell
hyperfine --prepare "node modify.mjs --type root --amount 1" \
--cleanup "git restore ." \
-n "Without project reference (root)" "nx build large-pkg1 --configuration=old --skip-nx-cache" \
-n "With project reference (root)" "nx build large-pkg1 --skip-nx-cache"
```

Results:

```
Benchmark 1: Without project reference (root)
  Time (mean ± σ):     44.951 s ±  1.981 s    [User: 227.709 s, System: 12.740 s]
  Range (min … max):   43.405 s … 50.098 s    10 runs

Benchmark 2: With project reference (root)
  Time (mean ± σ):     17.427 s ±  0.825 s    [User: 30.459 s, System: 3.578 s]
  Range (min … max):   16.097 s … 19.492 s    10 runs

  Warning: Statistical outliers were detected. Consider re-running this benchmark on a quiet system without any interferences from other programs. It might help to use the '--warmup' or '--prepare' options.

Summary
  With project reference (root) ran
    2.58 ± 0.17 times faster than Without project reference (root)
```

## Update one middle project

```shell
hyperfine --prepare "node modify.mjs --type middle --amount 1" \
--cleanup "git restore ." \
-n "Without project reference (middle)" "nx build large-pkg1 --configuration=old --skip-nx-cache" \
-n "With project reference (middle)" "nx build large-pkg1 --skip-nx-cache"
```

Results:

```
Benchmark 1: Without project reference (middle)
  Time (mean ± σ):     43.112 s ±  1.092 s    [User: 224.246 s, System: 12.234 s]
  Range (min … max):   41.863 s … 43.888 s    10 runs

Benchmark 2: With project reference (middle)
  Time (mean ± σ):     18.964 s ±  0.349 s    [User: 30.752 s, System: 3.632 s]
  Range (min … max):   18.625 s … 19.322 s    10 runs

Summary
  With project reference (middle) ran
    2.27 ± 0.07 times faster than Without project reference (middle)
```

## Update one leaf project

```shell
hyperfine --prepare "node modify.mjs --type leaf --amount 1" \
--cleanup "git restore ." \
-n "Without project reference (leaf)" "nx build large-pkg1 --configuration=old --skip-nx-cache" \
-n "With project reference (leaf)" "nx build large-pkg1 --skip-nx-cache"
```

Results:

```
Benchmark 1: Without project reference (leaf)
  Time (mean ± σ):     43.984 s ±  0.438 s    [User: 225.562 s, System: 12.658 s]
  Range (min … max):   43.446 s … 44.675 s    10 runs

Benchmark 2: With project reference (leaf)
  Time (mean ± σ):     17.048 s ±  0.506 s    [User: 30.536 s, System: 3.561 s]
  Range (min … max):   15.743 s … 17.675 s    10 runs

Summary
  With project reference ran
    2.58 ± 0.08 times faster than Without project reference
```

## Update many middle projects

```shell
hyperfine --prepare "node modify.mjs --type middle" \
--cleanup "git restore ." \
-n "Without project reference (middle)" "nx build large-pkg1 --configuration=old --skip-nx-cache" \
-n "With project reference (middle)" "nx build large-pkg1 --skip-nx-cache"
```

Results:

```
Benchmark 1: Without project reference (middle)
  Time (mean ± σ):     48.033 s ±  3.095 s    [User: 227.959 s, System: 12.255 s]
  Range (min … max):   45.521 s … 51.490 s    10 runs

Benchmark 2: With project reference (middle)
  Time (mean ± σ):     19.631 s ±  0.994 s    [User: 39.421 s, System: 4.009 s]
  Range (min … max):   18.486 s … 20.260 s    10 runs

Summary
  With project reference (middle) ran
    2.45 ± 0.20 times faster than Without project reference (middle)
```

## Update many leaf node projects

```shell
hyperfine --prepare "node modify.mjs --type leaf" \
--cleanup "git restore ." \
-n "Without project reference (leaf)" "nx build large-pkg1 --configuration=old --skip-nx-cache" \
-n "With project reference (leaf)" "nx build large-pkg1 --skip-nx-cache"
```

Results:

```
Benchmark 1: Without project reference (leaf)
  Time (mean ± σ):     46.302 s ±  0.091 s    [User: 228.797 s, System: 12.463 s]
  Range (min … max):   46.208 s … 46.389 s    10 runs

Benchmark 2: With project reference (leaf)
  Time (mean ± σ):     45.723 s ±  0.757 s    [User: 220.986 s, System: 12.023 s]
  Range (min … max):   44.853 s … 46.233 s    10 runs

Summary
  With project reference (leaf) ran
    1.01 ± 0.02 times faster than Without project reference (leaf)
```
