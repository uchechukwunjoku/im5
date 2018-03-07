'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    Pago = mongoose.model('Pago'),
    Costosindirecto = mongoose.model('Costosindirecto'),
    Servicio = mongoose.model('Servicio'),
    Factura = mongoose.model('Facturado'),
    Costcenter = mongoose.model('Costcenter'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

/**
 * Create a Pago
 */
exports.create = function (req, res) {
    var pago = new Pago(req.body);
    pago.user = req.user;

    pago.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(pago);
        }
    });
};

/**
 * Show the current Pago
 */
exports.read = function (req, res) {
   
    // convert mongoose document to JSON
    var pago = req.pago ? req.pago.toJSON() : {};

    // Add a custom field to the Article, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
    pago.isCurrentUserOwner = req.user && pago.user && pago.user._id.toString() === req.user._id.toString();

    res.jsonp(pago);
};

/**
 * Update a Pago
 */
exports.update = function (req, res) {
    var pago = req.pago;

    pago = _.extend(pago, req.body);

    pago.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(pago);
        }
    });
};

/**
 * Delete an Pago
 */
exports.delete = function (req, res) {
    var pago = req.pago;

    pago.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(pago);
        }
    });
};

/**
 * List of Pagos
 */
exports.list = function (req, res) {

    
    if(req.query.type === "serviceDetails"){
        Servicio.findById(req.query.servicosId)      
        .exec(function(err,service){
            if(err) throw err;
            res.json(service.operacion);
        });
        return;
    }


    var year = req.query.year || null;
    var month = req.query.month || null;
    var servicosId = req.query.servicosId || null;
    var impuestosId = req.query.impuestosId || null;
    var empleadoId = req.query.empleadoId || null;
    var enterprise = req.query.e || null;

    var filter = {};
    var data = [];
    if ((year !== null || month !== null) && servicosId == null && impuestosId == null && empleadoId == null) {
        filter.type = "costosIndirectos";
        if (year !== null)
            filter.year = year;
        if (month !== null)
            filter.month = month;
        
        filter.deleted = false;
        
        Pago.find(filter)
            .populate('servicios', "costcenters")
            .select({"servicios": 1, "montoE": 2, "montoC": 3})
            .sort('-created')
            .exec(function (err, pagos) {
              
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    var controAmount = [];
                    for (var i = 0; i < pagos.length; i++) { // code for get servicios total amount
                        var controID = pagos[i].servicios.costcenters[0];
                        if (controAmount[controID])
                            controAmount[controID] += pagos[i]['montoE'] + pagos[i]['montoC'];
                        else
                            controAmount[controID] = pagos[i]['montoE'] + pagos[i]['montoC'];
                    }
                    var controIDs = pagos.map(function (doc) {
                        return doc.servicios.costcenters[0];
                    });  // get valid servicios from pagos
                    // code for get valid costos by servicios
                    Costcenter.find({enterprise: enterprise, deleted: false})
                        .sort('-created')
                        .exec(function (err, centro) {
                           var resultObj;                           
                           var centroLen = centro.length - 1;
                            for (var i = 0; i < centro.length; i++) {
                                var total = 0;

                                if (controAmount[centro[i]._id]) {
                                    total = controAmount[centro[i]._id];
                                }                               
                                
                                //get facturado for service
                                 resultObj =   {
                                    id: centro[i]._id,
                                    name: centro[i].name,
                                    total: total
                                  }
                                getFactura(resultObj,i,centroLen)
                            }

                            
                            
                        });

                        function getFactura(centroInfo,centroIndex,centroLen) {
                          var facturaTotal = 0;
                           Factura.find({title1: centroInfo.name},{total:1},function(err,factura){
                              if(factura.length > 0) {                                
                                for(var j = 0; j < factura.length; j++) {
                                  facturaTotal += factura[j].total;
                                }
                              }
                              centroInfo.facturado = facturaTotal
                              data.push(centroInfo);

                              if(centroIndex === centroLen) {
                                sendResult(function(){                              
                                  
                                  res.jsonp(data);                                
                                })
                              }
                              
                          })
                        }

                        function sendResult(cb) {
                          cb();
                        }
                           


                }
            });
    } else if (servicosId !== null) {

        console.log('Pago  query  +++++++++++++');
        
        Pago.find({servicios: servicosId, deleted: false}).sort('-created')
            .populate('user', 'displayName')
            .populate('cajaD')
            .exec(function (err, pagos) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(pagos);
                }
            });

    } else if (impuestosId !== null) {
        if ((year !== null || month !== null)) {
            var startDate = moment().startOf('month');
            var endDate = startDate.clone().endOf('month');

            if (month && year) {
                startDate = moment().year(year).month(month).startOf("month");
                endDate = startDate.clone().endOf('month');
            } else if (month) {
                startDate = moment().month(month).startOf("month");
                endDate = startDate.clone().endOf('month');
            } else if (year) {
                startDate = moment().year(year).startOf("year");
                endDate = startDate.clone().endOf('year');
            }

            Pago.find({
                impuestos: impuestosId,
                deleted: false,
                pagoDate: {
                    $gt: startDate,
                    $lt: endDate
                }
            }).sort('-created')
                .populate('user', 'displayName')
                .populate('cajaD')
                .populate('impuestos')
                .exec(function (err, pagos) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(pagos);
                    }
                });
        } else {
            Pago.find({
                impuestos: impuestosId,
                deleted: false
                }).sort('-created')
                .populate('user', 'displayName')
                .populate('cajaD')
                .populate('impuestos')
                .exec(function (err, pagos) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(pagos);
                    }
                });
        }
    }  else if (empleadoId !== null) {
        if ((year !== null || month !== null)) {
            var startDate = moment().startOf('month');
            var endDate = startDate.clone().endOf('month');

            if (month && year) {
                startDate = moment().year(year).month(month).startOf("month");
                endDate = startDate.clone().endOf('month');
            } else if (month) {
                startDate = moment().month(month).startOf("month");
                endDate = startDate.clone().endOf('month');
            } else if (year) {
                startDate = moment().year(year).startOf("year");
                endDate = startDate.clone().endOf('year');
            }

            Pago.find({
                personal: empleadoId,
                deleted: false,
                pagoDate: {
                    $gt: startDate,
                    $lt: endDate
                }})
                .sort('-created')
                .populate('user', 'displayName')
                .populate('cajaD')
                .populate('personal')
                .populate('personal.userLogin')
                .exec(function (err, pagos) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(pagos);
                    }
                });
        } else {
            Pago.find({personal: empleadoId, deleted: false})
                .sort('-created')
                .populate('user', 'displayName')
                .populate('cajaD')
                .populate('personal')
                .populate('personal.userLogin')
                .exec(function (err, pagos) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(pagos);
                    }
                });
        }

    } else if (enterprise !== null) {
        
        Pago.find({enterprise: enterprise, deleted: false}).sort('-created')
            .populate('user', 'displayName')
            .populate('cajaD')
            .populate('servicios')
            .populate('impuestos')
            .exec(function (err, pagos) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(pagos);
                }
            });

    } else {

        filter.type = "costosIndirectos";
        Pago.find(filter)
            .populate('servicios', "costcenters")
            .select({"servicios": 1, "montoE": 2, "montoC": 3})
            .sort('-created')
            .exec(function (err, pagos) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)

                    });
                } else {
                    var controAmount = [];
                    for (var i = 0; i < pagos.length; i++) { // code for get servicios total amount
                        var controID = pagos[i].servicios.costcenters[0];
                        if (controAmount[controID])
                            controAmount[controID] += pagos[i]['montoE'] + pagos[i]['montoC'];
                        else
                            controAmount[controID] = pagos[i]['montoE'] + pagos[i]['montoC'];
                    }
                    var controIDs = pagos.map(function (doc) {
                        return doc.servicios.costcenters[0];
                    });  // get valid servicios from pagos

                    // code for get valid costos by servicios
                    Costcenter.find({_id: {$in: controIDs}})
                        .sort('-created')
                        .exec(function (err, centro) {
                            for (var i = 0; i < centro.length; i++) {
                                var total = controAmount[centro[i]._id];

                                data.push({
                                    id: centro[i]._id,
                                    name: centro[i].name,
                                    total: total

                                });
                            }
                            res.jsonp(data);
                        });
                }
            });
    }

};

/**
 * Pago middleware
 */
exports.pagoByID = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Pago is invalid'
        });
    }

    Pago.findById(id)
        .populate('user', 'displayName')
        .populate('servicios')
        .populate('impuestos')
        .exec(function (err, pago) {
            if (err) {
                return next(err);
            } else if (!pago) {
                return res.status(404).send({
                    message: 'No Pago with that identifier has been found'
                });
            }
            req.pago = pago;
            next();
        });
};
exports.getCostoLastMonthTotal = function (req, res) {
    var filter = {};
    var data = {};
    var serviciosAmount = [];
    filter.year = new Date().getFullYear();
    filter.month = new Date().getMonth() - 1;
    filter.type = "costosIndirectos";
    var controId = req.query.controId || null;
    Pago.find(filter)
        .populate('servicios')
        .sort('-created')
        .exec(function (err, pagos) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                for (var i = 0; i < pagos.length; i++) { // code for get servicios total amount
                    if (pagos[i].servicios && pagos[i].servicios.costcenters[0] == controId) {
                        var serviciosID = pagos[i].servicios._id;
                        if (serviciosAmount[serviciosID]) {
                            serviciosAmount[serviciosID] += pagos[i]['montoE'] + pagos[i]['montoC'];
                        }
                        else {
                            serviciosAmount[serviciosID] = pagos[i]['montoE'] + pagos[i]['montoC'];

                        }
                    }
                }
                // code for get valid costos by servicios
                Costosindirecto.find()
                    .sort('-created')
                    .populate('user', 'displayName')
                    .exec(function (err, costos) {

                        for (var i = 0; i < costos.length; i++) {
                            var serviciosArray = costos[i]['servicio'];
                            var total = 0;
                            for (var servicioID in serviciosAmount) {
                                if (serviciosArray.indexOf(servicioID) !== -1) { // if servicos id exists in costos
                                    total += serviciosAmount[servicioID];
                                }

                            }
                            var id = costos[i]['_id'];
                            data[id] = total;

                        }
                        res.jsonp(data);
                    });
            }

        });
};
exports.getServiciosLastMonthTotal = function (req, res) {
    var filter = {};
    var data = {};
    var serviciosAmount = [];
    filter.year = new Date().getFullYear();
    filter.month = new Date().getMonth() - 1;
    filter.type = "costosIndirectos";
    Pago.find(filter)
        .sort('-created')
        .exec(function (err, pagos) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                for (var i = 0; i < pagos.length; i++) { // code for get servicios total amount
                    var serviciosID = pagos[i].servicios;
                    if (serviciosAmount[serviciosID])
                        serviciosAmount[serviciosID] += pagos[i]['montoE'] + pagos[i]['montoC'];
                    else
                        serviciosAmount[serviciosID] = pagos[i]['montoE'] + pagos[i]['montoC'];
                }
                // code for get valid costos by servicios
                Servicio.find()
                    .exec(function (err, servicios) {
                        for (var i = 0; i < servicios.length; i++) {
                            var total = 0;

                            var serviciosID = servicios[i]['_id'];
                            if (serviciosAmount[serviciosID]) { // if servicos id exists in costos
                                total = serviciosAmount[serviciosID];
                            }
                            data[serviciosID] = total;

                        }
                        res.jsonp(data);
                    });
            }

        });
};