import { useContext } from "react";
import { Authcontext } from "../authcontext/Authcontext";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export function Home() {
  const { profile } = useContext(Authcontext);
  const branches = profile ?? [];
let navigation=useNavigate()
  return (
    <div className="home">
      <div className="home__inner">
        <div className="home__brand">Assignment Agents</div>

        <h1 className="home__title">Your branches</h1>
        <p className="home__sub">These are the branches linked to your account.</p>

        {branches.length === 0 ? (
          <p className="home__empty">No branch is linked to this account.</p>
        ) : (
          <ul className="home__list">
            {branches.map((b) => (
              <li className="branch" key={b.user_role_id}>
                <span className="branch__code">{b.branch_code}</span>
                <p className="branch__name">{b.branch_name}</p>
                <button onClick={()=>navigation(`/batches/${b["user_role_id"]}`)}>See Batches</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}