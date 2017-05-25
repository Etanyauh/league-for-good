const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');
const Team = mongoose.model('team');
const League = mongoose.model('league');


// Create a new team for a selected league
//after the team is saved, push the mongo generated _id into the 'teams' array with that league
//Send the newly created team back to the client 
const createTeam = (req, res) => {
	const league = req.body.league;

	const newTeam = new Team({
		name: req.body.name,
		league_id: league
	});

	newTeam.save()
		.then( team => {
			return League.findByIdAndUpdate(league, { $push: { teams: team} })
				.exec()
				.then(() => team); 
		})
		.then(team => res.send(team))
		.catch(error => res.send({ error }));
};

const deleteTeam = (req, res) => {
	const query = { _id: req.params.teamId };

	Team.remove(query)
		.exec()
		.then(() => res.send('Successfully removed team.'))
		.catch(error => res.send({msg:'An error occured while removing team', error}));
};

const updateTeam = (req, res) => {
	const query = { _id: req.params.teamId };
	const { league_id } = req.body;

	Team.update(query, req.body, {new:true, upsert:true})
		.exec()
		.then(() => res.send(req.body))
		.catch(error => res.status(500).json({ error: error}))
}

const showRoster = (req, res) => {
	//TODO - add search params 
	Team.findOne({})
		.select('name players')
		.populate('players')
		.exec()
		.then(team => res.send(team))
}

Router.route('/roster').get(showRoster);

Router.route('/create').post(createTeam);
Router.route('/remove/:teamId').delete(deleteTeam);
Router.route('/update/:teamId').put(updateTeam);

module.exports = Router;
