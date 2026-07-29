import type { CSSProperties } from "react";
import { profile, projects, work } from "@/lib/content";
import { plexCond, plexMono, plexSans } from "./fonts";
import {
  CLASS_CODE,
  ISSUE,
  WORK_STATE,
  abstract,
  endpoint,
  primaryLink,
  ref,
  since,
  smart,
  term,
  vitals,
} from "./data";
import { Instruments } from "./Instruments";
import { NamePlate } from "./NamePlate";
import { Tick } from "./Tick";
import st from "./spec.module.css";

const stagger = (i: number) => ({ "--i": i } as CSSProperties);

/* ------------------------------------------------------------------ parts -- */

function Row({ k, i, children }: { k: string; i: number; children: React.ReactNode }) {
  return (
    <div className={`${st.row} ${st.rowIn}`} style={stagger(i)}>
      <dt className={st.key}>
        <span>{k}</span>
        <span className={st.leader} aria-hidden="true" />
      </dt>
      <dd className={st.val}>{children}</dd>
    </div>
  );
}

function NumRow({
  k,
  i,
  value,
  literal,
}: {
  k: string;
  i: number;
  value?: number;
  literal?: string;
}) {
  return (
    <div className={`${st.row} ${st.rowIn}`} style={stagger(i)}>
      <dt className={st.key}>
        <span>{k}</span>
        <span className={st.leader} aria-hidden="true" />
      </dt>
      <dd className={`${st.val} ${st.valNum}`}>
        {literal ?? <Tick value={value ?? 0} />}
      </dd>
    </div>
  );
}

function Out({ href, label }: { href: string; label: string }) {
  return (
    <a className={st.link} href={href} target="_blank" rel="noreferrer noopener">
      {label}
      <span className={st.arrow} aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

function BlockLabel({ title, note }: { title: string; note: string }) {
  return (
    <p className={st.blockLabel}>
      <span>
        <span className={st.blockLabelMark}>§</span>&nbsp;{title}
      </span>
      <span>{note}</span>
    </p>
  );
}

function SectionHead({ n, title, note }: { n: number; title: string; note: React.ReactNode }) {
  return (
    <div className={st.sectionHead}>
      <h2 className={st.sectionTitle} id={`sec-${n}`}>
        <span className={st.sectionMark}>§&nbsp;{n}</span>
        <span className={st.sectionTitleText}>{title}</span>
      </h2>
      <span className={st.sectionCount}>{note}</span>
    </div>
  );
}

function RegMark() {
  return (
    <svg className={st.regmark} width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="3.75" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <path d="M6.5 0v13M0 6.5h13" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

/* ----------------------------------------------------------------- sheet -- */

export function SpecSheet() {
  const shell = `${plexCond.variable} ${plexSans.variable} ${plexMono.variable} ${st.root}`;

  return (
    <div className={shell}>
      <div className={st.ground} aria-hidden="true" />
      <div className={st.grain} aria-hidden="true" />

      <div className={st.doc}>
        <div className={st.page}>
          <div className={st.gridfield} aria-hidden="true" />

          <div className={st.layer}>
            {/* -------------------------------------------------- masthead */}
            <header className={`${st.masthead} ${st.fadeIn}`}>
              <span>
                <a className={st.mastLink} href="/">
                  manueldavid.dev
                </a>
              </span>
              <span className={st.mastheadMid}>
                Specification sheet&nbsp;&nbsp;·&nbsp;&nbsp;Issue&nbsp;{ISSUE}
              </span>
              <span className={st.mastheadEnd}>
                <Instruments />
              </span>
            </header>

            <main>
              {/* --------------------------------------------- title block */}
              <div className={st.titleBlock}>
                <div className={st.designation}>
                  <BlockLabel title="Designation" note="Sheet 1 of 1" />
                  <dl className={st.rows}>
                    <Row k="Name" i={0}>
                      {profile.name}
                    </Row>
                    <Row k="Title" i={1}>
                      {profile.role}
                    </Row>
                    <Row k="Organization" i={2}>
                      <Out href={profile.companyUrl} label={profile.company} />
                    </Row>
                    <Row k="Based" i={3}>
                      {profile.location}
                    </Row>
                    <Row k="Also" i={4}>
                      Founder, Paradigm and Nouvo
                    </Row>
                    <Row k="State" i={5}>
                      <span className={st.valSignal}>Shipping</span>
                    </Row>
                  </dl>
                </div>

                <aside className={st.rail} aria-label="Vitals">
                  <BlockLabel title="Vitals" note="Counted from the record" />
                  <dl className={`${st.rows} ${st.railRows}`}>
                    <NumRow k="Things built" literal={vitals.builtTotal} i={0} />
                    <NumRow k="Logged here" value={vitals.logged} i={1} />
                    <NumRow k="Open source" value={vitals.openSource} i={2} />
                    <NumRow k="Live for clients" value={vitals.clientSites} i={3} />
                    <NumRow k="Engagements" value={vitals.engagements} i={4} />
                    <NumRow k="Stack entries" value={vitals.stack} i={5} />
                    <NumRow k="Shipping since" literal={String(since)} i={6} />
                  </dl>
                </aside>
              </div>

              {/* ---------------------------------------------- name plate */}
              <NamePlate />

              {/* ----------------------------------------------- statement */}
              <section className={st.statement} aria-label="Summary">
                <h2 className={`${st.headline} ${st.fadeIn}`} style={stagger(16)}>
                  {profile.headline.replace(/\.$/, "")}
                  <span className={st.headlinePeriod}>.</span>
                </h2>
                <div className={st.abstract}>
                  {abstract.map((p) => (
                    <p key={p.slice(0, 24)} className={st.abstractText}>
                      {p}
                    </p>
                  ))}
                </div>
              </section>

              {/* --------------------------------------------- engagements */}
              <section className={st.section} aria-labelledby="sec-1">
                <SectionHead
                  n={1}
                  title="Engagements"
                  note={`${vitals.engagements} records · all active`}
                />

                <div className={st.recordHead} aria-hidden="true">
                  <span className={st.colhead}>Ref</span>
                  <span className={st.colhead}>Organization</span>
                  <span className={st.colhead}>Role</span>
                  <span className={st.colhead}>Term</span>
                  <span className={st.colhead}>State</span>
                  <span className={st.colhead}>Endpoint</span>
                </div>

                <ol className={st.records}>
                  {work.map((w, i) => (
                    <li key={w.company} className={st.record}>
                      <span className={`${st.cell} ${st.cellRef}`}>{ref("E", i)}</span>
                      <span className={`${st.cell} ${st.cellOrg}`}>{w.company}</span>
                      <span className={`${st.cell} ${st.cellRole}`}>{w.role}</span>
                      <span className={`${st.cell} ${st.cellTerm}`}>{term(w.dates)}</span>
                      <span
                        className={`${st.cell} ${st.cellState} ${
                          w.status === "current" ? st.status : st.statusMuted
                        }`}
                      >
                        {WORK_STATE[w.status]}
                      </span>
                      <span className={`${st.cell} ${st.cellLink}`}>
                        {w.url ? <Out href={w.url} label={endpoint(w.url)} /> : null}
                      </span>
                      <p className={st.recordBlurb}>{smart(w.blurb)}</p>
                    </li>
                  ))}
                </ol>
              </section>

              {/* ------------------------------------------------ build log */}
              <section className={st.section} aria-labelledby="sec-2">
                <SectionHead
                  n={2}
                  title="Build log"
                  note={`${vitals.logged} of ${vitals.builtTotal} · ${vitals.openSource} open source`}
                />

                <div className={st.logWrap}>
                  <table className={st.log}>
                    <caption className={st.srOnly}>
                      Selected projects, with class, year and a live endpoint.
                    </caption>
                    <colgroup>
                      <col className={st.colRef} />
                      <col className={st.colName} />
                      <col className={st.colDesc} />
                      <col className={st.colClass} />
                      <col className={st.colYear} />
                      <col className={st.colLink} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className={`${st.colhead} ${st.logRefCell}`} scope="col">
                          Ref
                        </th>
                        <th className={st.colhead} scope="col">
                          Name
                        </th>
                        <th className={`${st.colhead} ${st.logDescCell}`} scope="col">
                          Description
                        </th>
                        <th className={st.colhead} scope="col">
                          Class
                        </th>
                        <th className={st.colhead} scope="col">
                          Year
                        </th>
                        <th className={st.colhead} scope="col">
                          <span className={st.linkFull}>Endpoint</span>
                          <span className={st.narrowOnly}>Link</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p, i) => {
                        const href = primaryLink(p);
                        const cls = CLASS_CODE[p.status];
                        return (
                          <tr key={p.slug}>
                            <td className={st.logRefCell}>{ref("P", i)}</td>
                            <th scope="row" className={st.logNameCell}>
                              <span className={st.logName}>{p.name}</span>
                            </th>
                            <td className={st.logDescCell}>
                              <span className={st.logDesc}>{smart(p.blurb)}</span>
                            </td>
                            <td>
                              <abbr title={cls.full} className={st.code}>
                                {cls.code}
                              </abbr>
                            </td>
                            <td>{p.year}</td>
                            <td>
                              {href ? (
                                <a
                                  className={st.link}
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  aria-label={`${p.name}, open ${endpoint(href)}`}
                                >
                                  <span className={st.linkFull}>{endpoint(href)}</span>
                                  <span className={st.narrowOnly} aria-hidden="true">
                                    open
                                  </span>
                                  <span className={st.arrow} aria-hidden="true">
                                    ↗
                                  </span>
                                </a>
                              ) : p.clients ? (
                                <span className={st.muted}>
                                  {p.clients.length} sites
                                </span>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ---------------------------------------------------- stack */}
              <section className={st.section} aria-labelledby="sec-3">
                <SectionHead n={3} title="Working stack" note={`${vitals.stack} entries`} />
                <ul className={st.stack}>
                  {profile.skills.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </section>
            </main>

            {/* ------------------------------------------ endpoints, colophon */}
            <footer>
              <div className={st.foot}>
                <div className={st.endpoints}>
                  <BlockLabel title="Endpoints" note="Open to conversation" />
                  <dl className={st.rows}>
                    <Row k="Email" i={0}>
                      <a className={st.link} href={`mailto:${profile.email}`}>
                        {profile.email}
                      </a>
                    </Row>
                    <Row k="Book time" i={1}>
                      <Out href={profile.calendar} label="calendar.app.google" />
                    </Row>
                    <Row k="Code" i={2}>
                      <Out href={profile.github} label={endpoint(profile.github)} />
                    </Row>
                    <Row k="Record" i={3}>
                      <Out href={profile.linkedin} label="linkedin.com/in/manuel-david" />
                    </Row>
                    <Row k="Posting" i={4}>
                      <Out href={profile.x} label={profile.xHandle} />
                    </Row>
                  </dl>
                </div>

                <div className={st.colophon}>
                  <BlockLabel title="Colophon" note={`Issue ${ISSUE}`} />
                  <p className={st.colophonText}>
                    Set in IBM Plex Sans Condensed, IBM Plex Sans and IBM Plex Mono, a family
                    drawn for engineering documentation. Ground is bone. Ink is near black with
                    a single oxide vermilion.
                  </p>
                  <p className={st.colophonText}>
                    Twelve columns, hairline rules, tabular figures, zero corner radius. Every
                    figure on this sheet is counted from the record rather than typed by hand.
                  </p>
                </div>
              </div>

              <div className={st.tail}>
                <RegMark />
                <span>
                  {profile.name}&nbsp;&nbsp;·&nbsp;&nbsp;{profile.location}
                  &nbsp;&nbsp;·&nbsp;&nbsp;End of sheet
                </span>
                <RegMark />
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
