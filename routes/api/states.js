const express = require("express");
const router = express.Router();
const statesController = require('../../controllers/statesController');

router.route("/")
    .get(statesController.getAllStates);

router.route("/:state")
    .get(statesController.getSingleState);

router.route("/:state/funfact")
    .get(statesController.getSingleFunFact);    

router.route("/:state/capital")
    .get(statesController.getStateCapital)

router.route("/:state/nickname")
    .get(statesController.getStateNickname)

router.route("/:state/population")    
    .get(statesController.getStatePopulation)

router.route("/:state/admission")
    .get(statesController.getStateAdmissionDate)

router.route("/:state/funfact")
    .post(statesController.createStateInfo)
    .patch(statesController.updateStateInfo)
    .delete(statesController.deleteStateFunFact)

   


module.exports = router;
