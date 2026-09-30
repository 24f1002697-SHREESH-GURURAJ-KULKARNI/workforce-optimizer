// This router handles project CRUD actions.
// It validates input before saving and returns clear HTTP responses for errors.

const express = require('express');
const mongoose = require('mongoose');

const Project = require('../models/Project');

const router = express.Router();

// POST /api/projects/:id/generate-weights
router.post('/:id/generate-weights', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  let project;
  try {
    project = await Project.findById(id);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.requiredSkills.length === 0) {
    return res.status(400).json({ message: 'Project has no required skills' });
  }

  let generatedWeights;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You assign importance weights to skills required for a project. Respond with JSON only, using this exact shape: {"weights":[{"skillName":"...","weight":0.0}]}. Weights must sum to 1.',
          },
          {
            role: 'user',
            content: `Project: ${project.name}\nDescription: ${project.description}\nRequired skills: ${project.requiredSkills
              .map((skill) => skill.skillName)
              .join(', ')}\nAssign one weight per skill. Sum must be 1.`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const jsonText = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonText);

    if (
      !parsed ||
      !Array.isArray(parsed.weights) ||
      parsed.weights.some(
        (item) =>
          !item ||
          typeof item.skillName !== 'string' ||
          typeof item.weight !== 'number' ||
          !Number.isFinite(item.weight) ||
          item.weight < 0
      )
    ) {
      throw new Error('Invalid weights response');
    }

    generatedWeights = parsed.weights;
  } catch (err) {
    return res.status(502).json({ message: `AI service failed: ${err.message}` });
  }

  const requiredSkillNames = new Set(project.requiredSkills.map((skill) => skill.skillName));
  if (generatedWeights.some((item) => !requiredSkillNames.has(item.skillName))) {
    return res.status(502).json({ message: 'AI returned unknown skills' });
  }

  const rawSum = generatedWeights.reduce((sum, item) => sum + item.weight, 0);
  if (rawSum <= 0) {
    return res.status(502).json({ message: 'AI returned all-zero weights' });
  }

  for (const item of generatedWeights) {
    const skill = project.requiredSkills.find((requiredSkill) => requiredSkill.skillName === item.skillName);
    skill.weight = item.weight / rawSum;
  }

  try {
    const updatedProject = await project.save();
    return res.json(updatedProject);
  } catch (err) {
    return res.status(500).json({ message: 'Could not save project weights' });
  }
});

// Shared validation handler for bad project payloads.
function handleValidationError(res, err) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  return res.status(400).json({ message: 'Invalid project data' });
}

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (err) {
    return handleValidationError(res, err);
  }
});

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ name: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    Object.assign(project, req.body);
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    return handleValidationError(res, err);
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  try {
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
