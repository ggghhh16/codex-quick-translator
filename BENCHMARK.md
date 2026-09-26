# Translation latency benchmark (2026-09-25)

The fastest tested combination was **GPT-6 Luna + low reasoning + fast service (`priority`, advertised as 1.5×)**. Median time to first visible text was **3.572 seconds**; median time to complete was **4.945 seconds**.

## Method

- Called the real Codex App Server through the extension with runtime version `0.155.0-alpha.16.4`; no mocked model output.
- Ran five requests per configuration, cycling through short financial English, technical English and Japanese passages. Each model received the same passage in a given round.
- Ran requests sequentially with rotated model order, separate temporary sessions, a persistent App Server process and `low` reasoning throughout.
- Timed from session creation to the first visible text event, and from session creation to completion. App Server cold start was excluded.
- Checked for translation, explanation and context sections; did not conduct a full translation-quality assessment.
- GPT-5.6 Terra led on first-text latency after three rounds, so a standard-service comparison was added. Luna led after five rounds.

## Results

| Model | Service | Runs | Median first text | Median complete | First-text range |
| --- | --- | ---: | ---: | ---: | ---: |
| gpt-6-luna | Fast | 5 | 3.572 s | 4.945 s | 3.491–5.708 s |
| gpt-5.6-sol | Fast | 5 | 3.748 s | 5.200 s | 3.623–4.201 s |
| gpt-5.5 | Fast | 5 | 3.818 s | 5.298 s | 3.562–7.777 s |
| gpt-6-sol | Fast | 5 | 3.885 s | 5.274 s | 3.555–5.992 s |
| gpt-5.6-terra | Fast | 5 | 4.019 s | 5.148 s | 3.493–5.053 s |
| gpt-5.6-terra | Standard | 5 | 4.019 s | 6.221 s | 3.771–4.900 s |
| gpt-6-astra | Fast | 5 | 4.326 s | 6.430 s | 3.847–5.217 s |
| gpt-5.6-luna | Fast | 5 | 4.481 s | 5.935 s | 3.539–5.943 s |

## Limits

- These are five short-text samples from one account and network, not a universal model ranking. GPT-6 Luna and GPT-6 Sol differ by about 0.31 seconds in median first-text time; some of that difference may be noise.
- Explanation lengths varied by model, affecting completion time. Results are not a fixed token-throughput comparison.
- Advertised 1.5× service does not guarantee two-thirds of the end-to-end latency. Network, session setup and queuing still matter.
- Standard service and all reasoning levels were not tested for every model. “Fastest” refers only to the combinations in this table.
- An older local Codex version, `0.153.2`, returned unsupported-model errors for GPT-6 Sol/Luna. The newer version provided a model catalog and successful translations. The extension now prefers the newer official local Codex installation.
- The local Codex catalog lists `low` as the minimum for Sol/Luna; the extension does not offer the API documentation's `none` level for them.

Raw timings and output are stored in the local `.dev/benchmark.json`, which is excluded from release packages.
