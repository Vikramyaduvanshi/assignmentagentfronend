import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Base } from "../api.js";
import "./Checking.css";

const POLL_MS = 2500;

// remarks ek paragraph mein "1. ... 2. ... 3. ..." aate hain, unhe alag lines mein todta hai
function splitRemarks(text) {
    if (!text) return []
    let lines = String(text).split(/\n+/).map((s) => s.trim()).filter(Boolean)
    if (lines.length === 1) lines = lines[0].split(/\s+(?=\d+\.\s)/)
    return lines.map((l) => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean)
}

export function Checking() {
    let [params] = useSearchParams()
    let jobId = params.get("job_id")
    let navigate = useNavigate()

    let allBatches = useSelector((state) => state.Batches.batches)

    let [job, setJob] = useState(null)
    let [fatal, setFatal] = useState("")        // polling band karne wala error
    let [connErr, setConnErr] = useState(false) // temporary network problem
    let [q, setQ] = useState("")

    // batch id se batch ka naam (Redux mein jo data hai usse)
    let batchNames = useMemo(() => {
        let map = {}
        Object.values(allBatches).forEach((arr) =>
            arr.forEach((b) => { map[b.id] = b.name.trim() })
        )
        return map
    }, [allBatches])

    useEffect(() => {
        if (!jobId) return

        let stopped = false
        let timer
        let fails = 0
        let controller = new AbortController()

        async function poll() {
            try {
                let res = await axios.get(`${Base}/batches/assignments_check/${jobId}`, {
                    withCredentials: true,
                    signal: controller.signal,
                })
                if (stopped) return

                fails = 0
                setConnErr(false)
                setJob(res.data)
                if (res.data.status === "completed") return   // polling yahin band
            } catch (e) {
                if (stopped || axios.isCancel(e)) return

                let code = e.response?.status
                if (code === 404) {
                    setFatal("This check was not found. The server may have restarted. Go back and start it again.")
                    return
                }
                if (code === 401) {
                    setFatal("Session expired. Please sign in again.")
                    return
                }
                fails += 1
                setConnErr(true)
            }
            // network problem ho to dheere-dheere gap badhao (max 10s)
            timer = setTimeout(poll, Math.min(POLL_MS + fails * 10000, 10000))
        }

        poll()

        return () => {
            stopped = true
            controller.abort()
            clearTimeout(timer)
        }
    }, [jobId])

    if (!jobId) {
        return (
            <div className="checking">
                <div className="checking__inner">
                    <h1 className="checking__title">Checking assignments</h1>
                    <p className="checking__note">No check is running. Go back and select batches first.</p>
                </div>
            </div>
        )
    }

    let results = job?.results ?? []
    let errors = job?.errors ?? []
    let total = job?.total ?? 0
    let done = job?.done ?? 0
    let skipped = job?.skipped ?? 0
    let completed = job?.status === "completed"
    let percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : completed ? 100 : 0

    let term = q.trim()
    let shown = term
        ? results.filter((r) => String(r.admission_id).includes(term) || String(r.student_id).includes(term))
        : results

    let statusText
    if (fatal) statusText = fatal
    else if (!job) statusText = "Connecting to the check…"
    else if (!completed) statusText = "Reading submissions and writing marks. You can keep this page open."
    else if (total === 0) statusText = "Nothing to check. No pending assignment with a submission link was found."
    else statusText = `All done. ${results.length} marked, ${errors.length} failed, ${skipped} not submitted.`

    return (
        <div className="checking">
            <div className="checking__inner">
                <div className="checking__top">
                    <div className="checking__brand">Assignment Agents</div>
                    <button type="button" className="checking__back" onClick={() => navigate(-1)}>
                        Back to batches
                    </button>
                </div>

                <h1 className="checking__title">
                    {completed ? "Checking complete" : "Checking assignments"}
                </h1>
                <p className="checking__status" aria-live="polite">{statusText}</p>

                {connErr && !fatal && (
                    <p className="checking__conn" role="status">
                        Connection lost. Trying again…
                    </p>
                )}

                {job && (
                    <section className="progress" aria-label="Progress">
                        <div className="progress__head">
                            <span className="progress__count">{done} of {total} checked</span>
                            <span className="progress__percent">{percent}%</span>
                        </div>
                        <div
                            className="progress__track"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={total}
                            aria-valuenow={done}
                        >
                            <div className="progress__fill" style={{ width: `${percent}%` }} />
                        </div>

                        <dl className="stats">
                            <div><dt>Marked</dt><dd>{results.length}</dd></div>
                            <div><dt>Failed</dt><dd>{errors.length}</dd></div>
                            <div><dt>Not submitted</dt><dd>{skipped}</dd></div>
                        </dl>
                    </section>
                )}

                {results.length > 0 && (
                    <section className="checking__section">
                        <h2 className="checking__heading">
                            Results
                            {results.length > 4 && (
                                <input
                                    className="checking__input"
                                    type="search"
                                    placeholder="Search admission or student ID"
                                    aria-label="Search results by admission or student ID"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                />
                            )}
                        </h2>

                        {shown.length === 0 ? (
                            <p className="checking__note">No result matches “{term}”.</p>
                        ) : (
                            <ul className="checking__list">
                                {shown.map((r) => {
                                    let lines = splitRemarks(r.remarks)
                                    return (
                                        <li className="result" key={`${r.student_id}-${r.sheet_id}`}>
                                            <div className="result__row">
                                                <div>
                                                    <p className="result__title">Admission {r.admission_id}</p>
                                                    <p className="result__meta">
                                                        <span>{batchNames[r.batch_id] ?? `Batch ${r.batch_id}`}</span>
                                                        <span>{r.project ?? `Sheet ${r.sheet_id}`}</span>
                                                        <span>Student ID {r.student_id}</span>
                                                    </p>
                                                </div>
                                                <div className="result__marks" aria-label="Marks">
                                                    {r.total_marks != null ? `${r.marks}/${r.total_marks}` : r.marks}
                                                </div>
                                            </div>

                                            {r.submitted && <span className="result__saved">Marks saved</span>}

                                            {lines.length > 0 && (
                                                <details>
                                                    <summary className="checking__summary">Remarks</summary>
                                                    <ol className="result__remarks">
                                                        {lines.map((l, i) => <li key={i}>{l}</li>)}
                                                    </ol>
                                                </details>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </section>
                )}

                {errors.length > 0 && (
                    <section className="checking__section">
                        <h2 className="checking__heading">Needs attention</h2>
                        <ul className="checking__list">
                            {errors.map((e, i) => (
                                <li className="issue" key={`${e.student_id}-${i}`}>
                                    <p className="issue__title">Student ID {e.student_id}</p>
                                    <p className="issue__text">{e.error}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    )
}