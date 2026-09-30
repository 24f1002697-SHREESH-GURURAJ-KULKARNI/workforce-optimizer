import { useEffect, useState } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const SKILL_NAMES = ['React', 'Node', 'MongoDB'];

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'The request could not be completed.');
  }

  return data;
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [matches, setMatches] = useState(null);
  const [weightsVisible, setWeightsVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [employeeError, setEmployeeError] = useState('');
  const [projectError, setProjectError] = useState('');
  const [detailError, setDetailError] = useState('');

  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    weeklyAvailabilityHours: '40',
    skillLevels: { React: '1', Node: '1', MongoDB: '1' },
  });
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    selectedSkills: { React: false, Node: false, MongoDB: false },
  });

  useEffect(() => {
    async function loadInitialData() {
      try {
        const data = await apiRequest('/api/employees');
        setEmployees(data);
      } catch (err) {
        setEmployeeError(err.message);
      }

      try {
        const data = await apiRequest('/api/projects');
        setProjects(data);
      } catch (err) {
        setProjectError(err.message);
      }
    }

    loadInitialData();
  }, []);

  async function refreshEmployees() {
    const data = await apiRequest('/api/employees');
    setEmployees(data);
  }

  async function refreshProjects() {
    const data = await apiRequest('/api/projects');
    setProjects(data);
  }

  async function handleAddEmployee(event) {
    event.preventDefault();
    setEmployeeError('');

    const skills = SKILL_NAMES.map((skillName) => ({
      skillName,
      level: Number(employeeForm.skillLevels[skillName]),
    }));

    try {
      await apiRequest('/api/employees', {
        method: 'POST',
        body: JSON.stringify({
          name: employeeForm.name,
          email: employeeForm.email,
          weeklyAvailabilityHours: Number(employeeForm.weeklyAvailabilityHours),
          skills,
        }),
      });
      setEmployeeForm({
        name: '',
        email: '',
        weeklyAvailabilityHours: '40',
        skillLevels: { React: '1', Node: '1', MongoDB: '1' },
      });
      await refreshEmployees();
    } catch (err) {
      setEmployeeError(err.message);
    }
  }

  async function handleDeleteEmployee(employeeId) {
    setEmployeeError('');

    try {
      await apiRequest(`/api/employees/${employeeId}`, { method: 'DELETE' });
      setEmployees((currentEmployees) =>
        currentEmployees.filter((employee) => employee._id !== employeeId)
      );
    } catch (err) {
      setEmployeeError(err.message);
    }
  }

  async function handleAddProject(event) {
    event.preventDefault();
    setProjectError('');

    const requiredSkills = SKILL_NAMES.filter(
      (skillName) => projectForm.selectedSkills[skillName]
    ).map((skillName) => ({ skillName, minLevel: 3 }));

    try {
      await apiRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: projectForm.name,
          description: projectForm.description,
          requiredSkills,
        }),
      });
      setProjectForm({
        name: '',
        description: '',
        selectedSkills: { React: false, Node: false, MongoDB: false },
      });
      await refreshProjects();
    } catch (err) {
      setProjectError(err.message);
    }
  }

  async function handleGenerateWeights() {
    setActionLoading('weights');
    setDetailError('');
    setMatches(null);

    try {
      const updatedProject = await apiRequest(
        `/api/projects/${selectedProjectId}/generate-weights`,
        { method: 'POST' }
      );
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project._id === updatedProject._id ? updatedProject : project
        )
      );
      setWeightsVisible(true);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setActionLoading('');
    }
  }

  async function handleFindMatches() {
    setActionLoading('matches');
    setDetailError('');
    setMatches(null);

    try {
      const data = await apiRequest(`/api/projects/${selectedProjectId}/match`, {
        method: 'POST',
      });
      setMatches(data.matches);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setActionLoading('');
    }
  }

  const selectedProject = projects.find((project) => project._id === selectedProjectId);

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#f3f6f4',
      color: '#182521',
      fontFamily: 'Segoe UI, sans-serif',
      padding: '0 24px 48px',
    },
    shell: { width: '100%', maxWidth: '960px', margin: '0 auto' },
    header: {
      borderBottom: '1px solid #d9e2dc',
      padding: '26px 0 20px',
      marginBottom: '24px',
    },
    title: { margin: 0, fontSize: '28px', fontWeight: 700, letterSpacing: '0' },
    section: {
      background: '#ffffff',
      border: '1px solid #dce5df',
      borderRadius: '8px',
      padding: '22px',
      marginBottom: '18px',
      boxShadow: '0 3px 12px rgba(24, 37, 33, 0.04)',
    },
    sectionTitle: { margin: '0 0 16px', fontSize: '19px', fontWeight: 650 },
    fieldGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
      gap: '13px',
      marginBottom: '16px',
    },
    label: { display: 'grid', gap: '6px', color: '#43534c', fontSize: '13px', fontWeight: 600 },
    input: {
      width: '100%',
      boxSizing: 'border-box',
      border: '1px solid #cbd8d0',
      borderRadius: '5px',
      background: '#fff',
      padding: '10px 11px',
      color: '#182521',
      fontSize: '14px',
    },
    skillGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
      gap: '12px',
      marginBottom: '16px',
    },
    skillControl: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      border: '1px solid #e0e8e3',
      borderRadius: '5px',
      padding: '10px 12px',
      color: '#34463d',
      fontSize: '14px',
    },
    button: {
      border: 0,
      borderRadius: '5px',
      padding: '10px 15px',
      background: '#176b55',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 650,
    },
    secondaryButton: {
      border: '1px solid #b9cbc0',
      borderRadius: '5px',
      padding: '9px 13px',
      background: '#fff',
      color: '#176b55',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 650,
    },
    dangerButton: {
      border: '1px solid #e2b8b8',
      borderRadius: '5px',
      padding: '7px 10px',
      background: '#fff',
      color: '#a83232',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
    },
    error: { margin: '12px 0 0', color: '#b42318', fontSize: '14px' },
    empty: { margin: 0, color: '#6a7972', fontSize: '14px' },
    list: { display: 'grid', gap: '10px' },
    row: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      borderTop: '1px solid #e7ede9',
      padding: '13px 0',
    },
    identity: { minWidth: 0 },
    primaryText: { margin: 0, fontSize: '15px', fontWeight: 650 },
    secondaryText: { margin: '4px 0 0', color: '#687770', fontSize: '13px' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    tag: {
      borderRadius: '3px',
      background: '#e5f2ec',
      color: '#176b55',
      padding: '4px 7px',
      fontSize: '12px',
    },
    projectButton: {
      width: '100%',
      border: 0,
      borderTop: '1px solid #e7ede9',
      padding: '13px 4px',
      background: 'transparent',
      color: '#182521',
      cursor: 'pointer',
      textAlign: 'left',
      fontSize: '15px',
    },
    selectedProject: { background: '#f0f7f3', color: '#176b55', fontWeight: 700 },
    actionRow: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' },
    skillWeightRow: {
      display: 'grid',
      gridTemplateColumns: '110px minmax(80px, 1fr) 54px',
      alignItems: 'center',
      gap: '12px',
      borderTop: '1px solid #e7ede9',
      padding: '11px 0',
      fontSize: '13px',
    },
    barTrack: { height: '9px', overflow: 'hidden', borderRadius: '5px', background: '#e4ebe6' },
    matchList: { display: 'grid', gap: '12px', marginTop: '16px' },
    matchCard: {
      border: '1px solid #dce5df',
      borderRadius: '6px',
      padding: '17px',
      background: '#fbfdfb',
    },
    matchTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
    },
    score: { fontSize: '34px', fontWeight: 750, lineHeight: 1, color: '#176b55' },
    badge: { borderRadius: '4px', padding: '5px 9px', fontSize: '12px', fontWeight: 700 },
    breakdown: { display: 'grid', gap: '7px', marginTop: '13px' },
    breakdownRow: {
      display: 'grid',
      gridTemplateColumns: 'minmax(100px, 1fr) 80px 80px',
      gap: '10px',
      color: '#4e5d56',
      fontSize: '13px',
    },
    explanation: { margin: '14px 0 0', color: '#43534c', lineHeight: 1.55, fontSize: '14px' },
    loading: { margin: '10px 0', color: '#176b55', fontSize: '14px', fontWeight: 600 },
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <h1 style={styles.title}>AI Workforce Optimizer</h1>
        </header>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Add Employee</h2>
          <form onSubmit={handleAddEmployee}>
            <div style={styles.fieldGrid}>
              <label style={styles.label}>
                Name
                <input
                  required
                  style={styles.input}
                  value={employeeForm.name}
                  onChange={(event) =>
                    setEmployeeForm({ ...employeeForm, name: event.target.value })
                  }
                />
              </label>
              <label style={styles.label}>
                Email
                <input
                  required
                  type="email"
                  style={styles.input}
                  value={employeeForm.email}
                  onChange={(event) =>
                    setEmployeeForm({ ...employeeForm, email: event.target.value })
                  }
                />
              </label>
              <label style={styles.label}>
                Weekly availability (hours)
                <input
                  required
                  type="number"
                  min="0"
                  max="40"
                  style={styles.input}
                  value={employeeForm.weeklyAvailabilityHours}
                  onChange={(event) =>
                    setEmployeeForm({
                      ...employeeForm,
                      weeklyAvailabilityHours: event.target.value,
                    })
                  }
                />
              </label>
            </div>
            <div style={styles.skillGrid}>
              {SKILL_NAMES.map((skillName) => (
                <label key={skillName} style={styles.skillControl}>
                  <span>{skillName} level</span>
                  <select
                    aria-label={`${skillName} level`}
                    style={{ ...styles.input, width: '76px', padding: '7px' }}
                    value={employeeForm.skillLevels[skillName]}
                    onChange={(event) =>
                      setEmployeeForm({
                        ...employeeForm,
                        skillLevels: {
                          ...employeeForm.skillLevels,
                          [skillName]: event.target.value,
                        },
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <button type="submit" style={styles.button}>Add Employee</button>
            {employeeError && <p role="alert" style={styles.error}>{employeeError}</p>}
          </form>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Employees</h2>
          {employees.length === 0 ? (
            <p style={styles.empty}>No employees yet.</p>
          ) : (
            <div style={styles.list}>
              {employees.map((employee) => (
                <div key={employee._id} style={styles.row}>
                  <div style={styles.identity}>
                    <p style={styles.primaryText}>{employee.name}</p>
                    <p style={styles.secondaryText}>{employee.email}</p>
                    <div style={styles.tags}>
                      {employee.skills.map((skill) => (
                        <span key={skill.skillName} style={styles.tag}>
                          {skill.skillName} · {skill.level}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    style={styles.dangerButton}
                    onClick={() => handleDeleteEmployee(employee._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Add Project</h2>
          <form onSubmit={handleAddProject}>
            <div style={styles.fieldGrid}>
              <label style={styles.label}>
                Name
                <input
                  required
                  style={styles.input}
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm({ ...projectForm, name: event.target.value })
                  }
                />
              </label>
              <label style={styles.label}>
                Description
                <input
                  required
                  style={styles.input}
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm({ ...projectForm, description: event.target.value })
                  }
                />
              </label>
            </div>
            <div style={styles.skillGrid}>
              {SKILL_NAMES.map((skillName) => (
                <label key={skillName} style={styles.skillControl}>
                  <span>{skillName} · minimum level 3</span>
                  <input
                    type="checkbox"
                    checked={projectForm.selectedSkills[skillName]}
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        selectedSkills: {
                          ...projectForm.selectedSkills,
                          [skillName]: event.target.checked,
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <button type="submit" style={styles.button}>Add Project</button>
            {projectError && <p role="alert" style={styles.error}>{projectError}</p>}
          </form>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Projects</h2>
          {projects.length === 0 ? (
            <p style={styles.empty}>No projects yet.</p>
          ) : (
            <div>
              {projects.map((project) => (
                <button
                  key={project._id}
                  type="button"
                  style={{
                    ...styles.projectButton,
                    ...(selectedProjectId === project._id ? styles.selectedProject : {}),
                  }}
                  onClick={() => {
                    setSelectedProjectId(project._id);
                    setMatches(null);
                    setWeightsVisible(false);
                    setDetailError('');
                  }}
                >
                  <strong>{project.name}</strong>
                  <span style={{ display: 'block', marginTop: '4px', color: '#687770', fontSize: '13px' }}>
                    {project.description}
                  </span>
                </button>
              ))}
            </div>
          )}
          {projectError && <p role="alert" style={styles.error}>{projectError}</p>}
        </section>

        {selectedProject && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Project Detail</h2>
            <p style={{ ...styles.primaryText, marginBottom: '15px' }}>{selectedProject.name}</p>
            <div style={styles.actionRow}>
              <button
                type="button"
                style={styles.button}
                disabled={Boolean(actionLoading)}
                onClick={handleGenerateWeights}
              >
                Generate AI Weights
              </button>
              <button
                type="button"
                style={styles.secondaryButton}
                disabled={Boolean(actionLoading)}
                onClick={handleFindMatches}
              >
                Find Best Matches
              </button>
            </div>

            {actionLoading && <p style={styles.loading}>Loading…</p>}
            {detailError && <p role="alert" style={styles.error}>{detailError}</p>}

            {weightsVisible && (
              <div aria-label="Project skill weights">
                {selectedProject.requiredSkills.map((skill) => (
                  <div key={skill.skillName} style={styles.skillWeightRow}>
                    <strong>{skill.skillName}</strong>
                    <div style={styles.barTrack}>
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(skill.weight * 100, 100))}%`,
                          height: '100%',
                          background: '#2b9a72',
                        }}
                      />
                    </div>
                    <span>{Number(skill.weight).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {matches !== null && (
              matches.length === 0 ? (
                <p style={styles.empty}>No employee matches to show.</p>
              ) : (
                <div style={styles.matchList}>
                  {matches.map((match) => {
                    const verdictColors = {
                      Low: { background: '#fde8e7', color: '#a83232' },
                      Moderate: { background: '#fff1cc', color: '#875900' },
                      High: { background: '#dff3e8', color: '#176b45' },
                    };

                    return (
                      <article key={match.employee._id} style={styles.matchCard}>
                        <div style={styles.matchTop}>
                          <div>
                            <h3 style={{ ...styles.primaryText, marginBottom: '7px' }}>
                              {match.employee.name}
                            </h3>
                            <span style={{ ...styles.badge, ...verdictColors[match.verdict] }}>
                              {match.verdict}
                            </span>
                          </div>
                          <div aria-label={`Score ${match.score}`} style={styles.score}>
                            {match.score}
                          </div>
                        </div>
                        <div style={styles.breakdown}>
                          {match.breakdown.map((item) => (
                            <div key={item.skillName} style={styles.breakdownRow}>
                              <span>{item.skillName}</span>
                              <span>Match: {item.match}</span>
                              <span>Weight: {item.weight}</span>
                            </div>
                          ))}
                        </div>
                        <p style={styles.explanation}>{match.explanation}</p>
                      </article>
                    );
                  })}
                </div>
              )
            )}
          </section>
        )}
      </div>
    </main>
  );
}