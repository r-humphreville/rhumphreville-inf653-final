const e = require("express");
const { findOneAndDelete } = require("../model/States");
const StatesDB = require("../model/States");
const data = {
  states: require("../model/states.json"),
  setStates: function (data) {
    this.states = data;
  },
};

const getAllStates = async (req, res) => {
  let statesList;
  let jsonStates = data.states;
  const { contig } = req.query;
  console.log(contig);
  if (contig === "true") {
    function filterOutAkandHI(jsonStates) {
      if (jsonStates.code == "AK" || jsonStates.code == "HI") {
        return false;
      }
      return true;
    }
    statesList = jsonStates.filter(filterOutAkandHI);
  } else if (contig === "false") {
    statesList = jsonStates.filter((st) => st.code === "AK" || st.code === "HI");
  } else {
    statesList = data.states;
  }
  let statesFromDB = await StatesDB.find({});
  statesList.forEach((state) => {
    const statesMatch = statesFromDB.find((st) => st.stateCode === state.code);
    if (statesMatch) {
      console.log(statesMatch.stateCode + " Matches " + state.code);
      state.funfacts = [...statesMatch.funfacts];
    }
  });
  res.json(statesList);
};

const getSingleState = async (req, res) => {
  console.log("Reached here");
  let jsonStates = data.states;
  let statesFromDB = await StatesDB.find({});
  const state = jsonStates.find((state) => state.code === req.params.state.toUpperCase());
  if (!state) {
    return res.status(400).json({ message: `Invalid state abbreviation parameter` });
  }
  const stateMatch = statesFromDB.find((st) => st.stateCode === state.code);
  if (stateMatch) {
    console.log(stateMatch.stateCode + " Matches " + state.code);
    state.funfacts = [...stateMatch.funfacts];
  }
  res.json(state);
};

const getSingleFunFact = async (req, res) => {
  console.log("Here from get single fun fact");
  let jsonStates = data.states;
  let statesFromDB = await StatesDB.find({});
  const state = jsonStates.find((state) => state.code === req.params.state.toUpperCase());

  if (!state) {
    return res.status(400).json({ message: `Invalid state abbreviation parameter` });
  }

  const stateMatch = statesFromDB.find((st) => st.stateCode === state.code);
  if (stateMatch) {
    console.log(stateMatch.stateCode + " Matches " + state.code);
    state.funfacts = [...stateMatch.funfacts];
  } else if (!state.funfacts) {
    return res.json({ message: `No Fun Facts found for ${state.state}` });
  }

  return res.json({
    funfact: `${
      state.funfacts[Math.floor(Math.random() * state.funfacts.length - 1) + 1]
    }`,
  });
};

const getStateCapital = async (req, res) => {
  console.log("Here from getStateCapital");
  const state = data.states.find(
    (state) => state.code === req.params.state.toUpperCase()
  );
  if (!state) {
    return res.status(400).json({ message: `Invalid state abbreviation parameter` });
  }
  res.json({ state: `${state.state}`, capital: `${state.capital_city}` });
};

const getStateNickname = async (req, res) => {
  console.log("here from the getStateNickname Function");
  const state = data.states.find(
    (state) => state.code === req.params.state.toUpperCase()
  );

  if (!state) {
    return res.status(400).json({ message: `Invalid state abbreviation parameter` });
  }
  res.json({ state: `${state.state}`, nickname: `${state.nickname}` });
};

const getStatePopulation = async (req, res) => {
  console.log("Here from getStatePopulation Function");
  const state = data.states.find(
    (state) => state.code === req.params.state.toUpperCase()
  );
  if (!state) {
    return res.status(400).json({ message: `Invalid state abbreviation parameter` });
  } else {
    res.json({
      state: `${state.state}`,
      population: `${state.population.toLocaleString()}`,
    });
  }
};

const getStateAdmissionDate = async (req, res) => {
  console.log("here from getStateAdmissionDate function");
  const state = data.states.find(
    (state) => state.code === req.params.state.toUpperCase()
  );
  if (!state) {
    return res.status(400).json({ message: `Invalid state abbreviation parameter` });
  } else {
    res.json({ state: `${state.state}`, admitted: `${state.admission_date}` });
  }
};

const createStateInfo = async (req, res) => {
  console.log("Here from create state info");
  if (!req.body.funfacts) {
    return res.status(400).json({ message: "State fun facts value required" });
  }

  if (!Array.isArray(req.body.funfacts)) {
    return res.json({ message: "State fun facts value must be an array" });
  }

  const foundState = await StatesDB.findOne({
    stateCode: req.params.state.toUpperCase(),
  });
  console.log(foundState);
  if (!foundState) {
    try {
      const result = await StatesDB.create({
        stateCode: req.params.state,
        funfacts: req.body.funfacts,
      });
      res.status(201).json(result);
    } catch (err) {
      console.error(err);
    }
  } else if (foundState) {
    console.log("Reached here two");
    console.log(foundState.funfacts.length);
    for (let num = 0; num < data.length; num++) {
      foundState.funfacts.push(data[num]);
    }
    const result = await foundState.save();
    res.status(201).json(result);
  }
};

const updateStateInfo = async (req, res) => {
  let jsonStates = data.states;
  console.log("Here from update State Info function");
  if (!req.body.index) {
    return res.status(400).json({ message: `State fun fact index value required` });
  }
  if (!req.body.funfact) {
    return res.status(400).json({ message: `State fun fact value required` });
  }
  const state = await StatesDB.findOne({
    stateCode: req.params.state.toUpperCase(),
  }).exec();
  let index = req.body.index + 1;
  if (!state) {
    let stateWithNoFunFacts = jsonStates.filter(
      (st) => st.code === req.params.state.toUpperCase()
    );
    console.log(stateWithNoFunFacts[0].state);
    return res
      .status(400)
      .json({ message: `No Fun Facts found for ${stateWithNoFunFacts[0].state}` });
  }

  index = index - 1;
  if (index < 0 || req.body.index > state.funfacts.length) {
    let stateWithNoFunFacts = jsonStates.filter(
      (st) => st.code === req.params.state.toUpperCase()
    );
    return res
      .status(400)
      .json({
        message: `No Fun Fact found at that index for ${stateWithNoFunFacts[0].state}`,
      });
  }
  state.funfacts[index] = req.body.funfact;
  const result = await state.save();
  return res.json(result);
};

const deleteStateFunFact = async (req, res) => {
  let jsonStates = data.states;
  let index = req?.body?.index + 1;
  if (!index) {
    return res.status(400).json({ message: `State fun fact index value required` });
  }
  index = index - 1;
  const foundState = await StatesDB.findOne({
    stateCode: req.params.state.toUpperCase(),
  }).exec();
  if (!foundState || foundState == null) {
    let stateWithNoFunFacts = jsonStates.filter(
      (st) => st.code === req.params.state.toUpperCase()
    );
    console.log(stateWithNoFunFacts[0].state);
    return res
      .status(400)
      .json({ message: `No Fun Facts found for ${stateWithNoFunFacts[0].state}` });
  }

  if (index < 0 || req.body.index > foundState.funfacts.length) {
    let stateWithNoFunFacts = jsonStates.filter(
      (st) => st.code === req.params.state.toUpperCase()
    );
    return res
      .status(400)
      .json({
        message: `No Fun Fact found at that index for ${stateWithNoFunFacts[0].state}`,
      });
  }
  console.log(foundState.funfacts[index]);
  foundState.funfacts.splice(index, 1);
  const result = await foundState.save();
  console.log(result);
  res.json(result);
};

module.exports = {
  getAllStates,
  getSingleState,
  getStateCapital,
  getStateNickname,
  getStatePopulation,
  getStateAdmissionDate,
  getSingleFunFact,
  createStateInfo,
  updateStateInfo,
  deleteStateFunFact,
};
