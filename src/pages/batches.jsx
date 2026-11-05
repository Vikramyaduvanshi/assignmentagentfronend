import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Base } from "../api.js";

import "./batches.css";
import { fetchbatches } from "../redux/batchslice.js";

export function Batches() {
    let { id } = useParams()            // user_role_id (URL se string aati hai)
    let roleId = Number(id)

    let dispatch = useDispatch()
    let navigate = useNavigate()

    let { err } = useSelector((state) => state.Batches)
    let list = useSelector((state) => state.Batches.batches[roleId])

    let [selected, setSelected] = useState([])      // chuni hui batch ids
    let [starting, setStarting] = useState(false)
    let [startErr, setStartErr] = useState("")

    useEffect(() => {
        setSelected([])
        if (Number.isInteger(roleId)) {
            dispatch(fetchbatches({ userroleid: roleId }))
        }
    }, [dispatch, roleId])

    function toggle(batchId) {
        setSelected((prev) =>
            prev.includes(batchId) ? prev.filter((v) => v !== batchId) : [...prev, batchId]
        )
    }

    async function handleCheck() {
        if (starting || selected.length === 0) return

        setStartErr("")
        setStarting(true)
        try {
            let res = await axios.post(`${Base}/batches/assignments_check`,
                { batch_array: selected, user_role_id: roleId },
                { withCredentials: true }
            )
            let ans = res.data

            if (ans.success && ans.job_id) {
                navigate(`/checking?job_id=${ans.job_id}`)
                return
            }
            setStartErr("Could not start the check. Try again.")
        } catch (e) {
            setStartErr(
                e.response?.status === 401
                    ? "Session expired. Please sign in again."
                    : "Could not start the check. Try again."
            )
        } finally {
            setStarting(false)
        }
    }

    let body
    if (!Number.isInteger(roleId)) {
        body = <p className="batches__note">This branch link is not valid.</p>
    } else if (!list && !err) {
        body = <p className="batches__note">Loading batches…</p>
    } else if (!list) {
        body = (
            <div className="batches__note batches__note--error" role="alert">
                <p>{err}</p>
                <button
                    type="button"
                    className="batches__retry"
                    onClick={() => dispatch(fetchbatches({ userroleid: roleId, force: true }))}
                >
                    Try again
                </button>
            </div>
        )
    } else if (list.length === 0) {
        body = <p className="batches__note">No ongoing batches found for this branch.</p>
    } else {
        body = (
            <ul className="batches__list">
                {list.map((b) => {
                    let on = selected.includes(b.id)
                    return (
                        <li key={b.id}>
                            <label className={on ? "batch batch--on" : "batch"}>
                                <input
                                    className="batch__check"
                                    type="checkbox"
                                    checked={on}
                                    onChange={() => toggle(b.id)}
                                />
                                <span className="batch__name">{b.name.trim()}</span>
                                <span className="batch__status">{b.batches_status}</span>
                                <span className="batch__count">Count {b.count ?? 0}</span>
                            </label>
                        </li>
                    )
                })}
            </ul>
        )
    }

    return (
        <div className="batches">
            <div className="batches__inner">
                <div className="batches__brand">Assignment Agents</div>

                <h1 className="batches__title">Select batches</h1>
                <p className="batches__sub">
                    Pick the batches whose pending assignments you want to check.
                </p>

                {body}
            </div>

            <div className="batches__bar">
                {startErr && (
                    <p className="batches__error" role="alert">
                        {startErr}
                    </p>
                )}
                <div className="batches__bar-inner">
                    <span className="batches__selected">{selected.length} selected</span>
                    <button
                        type="button"
                        className="batches__go"
                        disabled={selected.length === 0 || starting}
                        onClick={handleCheck}
                    >
                        {starting ? "Starting…" : "Check"}
                    </button>
                </div>
            </div>
        </div>
    )
}