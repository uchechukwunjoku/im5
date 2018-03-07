'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Finanza = mongoose.model('Finanza'),
	Factura = mongoose.model('Facturado'),
	Servicio = mongoose.model('Servicio'),
 	Pago = mongoose.model('Pago'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Comprobante
 */
exports.create = function(req, res) {
	var finanza = new Finanza(req.body);
	finanza.user = req.user;

	finanza.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(finanza);
		}
	});
};

/**
 * Show the current finanza
 */
exports.read = function(req, res) {
	res.jsonp(req.finanza);
};

/**
 * Update a finanza
 */
exports.update = function(req, res) {
	var finanza = req.finanza ;

	finanza = _.extend(finanza , req.body);

	finanza.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(finanza);
		}
	});
};

/**
 * Delete an Comprobante
 */
exports.delete = function(req, res) {
	var finanza = req.finanza ;
	finanza.deleted = true;
	finanza.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(finanza);
		}
	});
};

/**
 * List of Comprobantes
 */
exports.list = function(req, res) {
	
	var enterprise = req.query.e || null;
	var limit = req.query.limit ? parseInt(req.query.limit) : null;
	var last = req.query.last ? req.query.last : null;

	try {
		last = JSON.parse(last);
	} catch (e) {
		return res.status(400).send({message: "couldn't parse JSON"});
	}

	
	
	if(req.query.type === "facturas") {
		Factura.find({enterprise: req.query.enterprise},function(err,facturas){
			if(err) {
				console.log('error occured', err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(facturas);
			}
		})
		return;
	}


	if (enterprise !== null) {
		
		if (last) {
			Finanza.find({enterprise: enterprise, saldo: { $lte: last.saldo,  $ne: 0 }, created: { $ne: last.created}, tipoFinanza: req.query.type, deleted: false})
			.sort('-saldo')
			.populate('user', 'displayName')
			.populate('enterprise', 'name')
			.populate('provider', 'name')
			.populate('comprobante', 'name')
			.populate('client', 'name')
			.limit(limit)
			.exec(function(err, finanzas) {
				if (err) {
					console.log('error occured', err);
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(finanzas);
				}
			});
		} else {
			Finanza.find({enterprise: enterprise, tipoFinanza: req.query.type, saldo: { $ne: 0 }, deleted: false})
			.sort('-saldo')
			.populate('user', 'displayName')
			.populate('enterprise', 'name')
			.populate('provider', 'name')
			.populate('comprobante', 'name')
			.populate('client', 'name')
			.limit(limit)
			.exec(function(err, finanzas) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(finanzas);
				}
			});
		}
	}
	else{
		if (last) {
			Finanza.find({ saldo: { $lte: last.saldo,  $ne: 0 }, created: { $ne: last.created}, tipoFinanza: req.query.type, deleted: false })
			.sort('-saldo')
			.populate('user', 'displayName')
			.populate('enterprise', 'name')
			.populate('provider', 'name')
			.populate('comprobante', 'name')
			.populate('client', 'name')
			.limit(limit)
			.exec(function(err, finanzas) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(finanzas);
				}
			});
		} else {
			Finanza.find({tipoFinanza: req.query.type, deleted: false, saldo: { $ne: 0 } })
			.sort('-saldo')
			.populate('user', 'displayName')
			.populate('enterprise', 'name')
			.populate('provider', 'name')
			.populate('comprobante', 'name')
			.populate('client', 'name')
			.limit(limit)
			.exec(function(err, finanzas) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(finanzas);
				}
			});
		}
	}
};

/**
 * Comprobante middleware
 */
exports.finanzaByID = function(req, res, next, id) {
	Finanza.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('provider', 'name')
	.populate('comprobante', 'name')
	.populate('client', 'name')
	.exec(function(err, finanza) {
		if (err) return next(err);
		if (! finanza) return next(new Error('Failed to load finanza ' + id));
		req.finanza = finanza ;
		next();
	});
};
