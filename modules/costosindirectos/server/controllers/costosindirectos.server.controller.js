'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Costosindirecto = mongoose.model('Costosindirecto'),
    Servicio = mongoose.model('Servicio'),
    Pago = mongoose.model('Pago'),
    Factura = mongoose.model('Facturado'),
    Servicio = mongoose.model('Servicio'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

/**
 * Create a Costosindirecto
 */
exports.create = function (req, res) {
    var costosindirecto = new Costosindirecto(req.body);
    costosindirecto.user = req.user;

    costosindirecto.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(costosindirecto);
        }
    });
};

/**
 * Show the current Costosindirecto
 */
exports.read = function (req, res) {
    // convert mongoose document to JSON
    var costosindirecto = req.costosindirecto ? req.costosindirecto.toJSON() : {};

    // Add a custom field to the Article, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
    costosindirecto.isCurrentUserOwner = req.user && costosindirecto.user && costosindirecto.user._id.toString() === req.user._id.toString();

    res.jsonp(costosindirecto);
};



/**
 * Update a Costosindirecto
 */
exports.update = function (req, res) {
    var costosindirecto = req.costosindirecto;
    
    var reqData = { 
      title1: req.body.title1,
      title2: req.body.title2,
      numero: req.body.numero,
      servicios: req.body.servicios,
      serviceName: req.body.serviceName,
      montoE: req.body.montoE,
      facturaDate: req.body.facturaDate,
      month: req.body.month,
      year: req.body.year,
      observaciones: req.body.observaciones,
      enterprise: req.body.enterprise,
      type: req.body.type,
      isFactura: req.body.isFactura,
      total: req.body.total
    }

    if(req.body.isFactura ) {        
        if(Factura) {
            Factura.findOne({month: req.body.month.toString(),year: req.body.year.toString(),serviceName:req.body.serviceName},{total:1,facturaDate:1})
            .exec(function(err,data){
             
                if(err) throw err;
                if(data) {
                   
                    data.total = req.body.total; // piece of factura totals individual sevice total; which sums up to be fcturado.
                    data.facturaDate = req.body.facturaDate;
                    data.save(function(err,info){
                        console.log("factura closed");
                        saveCostIndirecto()
                    })
                } else {
                    createFactura()
                }               
            })  
        } else {
          createFactura();
        }

        console.log(req.body);
        updateServicio(req.body);

        function createFactura() {
          /*Factura.remove({},function(err,info){
            console.log(info);
          })*/
          var factura = new Factura(reqData)
          factura.save(function(err,info){             
              saveCostIndirecto();              
          }) 
            
        } 


        function updateServicio(t) {
            Servicio.findById(t.servicios)
            .populate('user',"displayName")
            .exec(function(err,service){
                if(err) throw err;               
                var facturaOperacion = {
                    id: genId(),
                    type: "factura",
                    saldo: null,
                    date: req.body.facturaDate,
                    montoE: req.body.montoE,
                    numero: req.body.numero,
                    facturado: req.body.total,
                    pagado: null,
                    created_by: service.user.displayName
                }
                if(!service.operacion) {
                    service.operacion = [];
                    service.operacion.push(facturaOperacion);                  
                } else if(service.operacion.length > 0) {
                    var lastOperacion = service.operacion[service.operacion.length - 1];
                    if(lastOperacion.type === "pago") {
                       facturaOperacion.saldo = lastOperacion.saldo;
                       facturaOperacion.pagado = lastOperacion.pagado;
                       service.operacion.push(facturaOperacion);
                    }
                } else { //remove later
                    service.operacion = [];
                    service.operacion.push(facturaOperacion);
                }

                service.save(function(err,info){
                    console.log(facturaOperacion);
                    console.log("operations factura saved!");
                });
            })
            /*
             "type" : "pago",
                        "saldo" : -229,
                        "date" : ISODate("2018-01-25T19:45:43.848Z"),
                        "montoE" : 20,
                        "cajaD" : "Caja 1",
                        "facturado" : null,
                        "pagado" : 1195,
                        "created_by" : "Justo Maselli"
            */

             function genId() {
              var text = "";
              var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567899966600555777222";

                for( var i=0; i < 15; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                return text;
             }
        }       
       
    } else {
      saveCostIndirecto();
    }


    function saveCostIndirecto() {
      

      costosindirecto = _.extend(costosindirecto, req.body);
     
      costosindirecto.save(function (err) {
          if (err) {
              return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
              });
          } else {
              res.jsonp(costosindirecto);
          }
      });
   }
};

/**
 * Delete an Costosindirecto
 */
exports.delete = function (req, res) {
    var costosindirecto = req.costosindirecto;

    costosindirecto.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(costosindirecto);
        }
    });
};

/**
 * List of Costosindirectos
 */

exports.list = function (req, res) {
    
    var enterprise = req.query.e || null;
    var centroId = req.query.centroId || null;
    var year = req.query.year || null;
    var month = req.query.month || null;
    var filter = {};
    if (enterprise !== null) {
        Costosindirecto.find({enterprise: enterprise})
            .sort('-created')
            .populate('user', 'displayName')
            .exec(function (err, costosindirecto) {
               
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(costosindirecto);
                }
            });
    } else if (year !== null || month !== null) {
        filter.type = "costosIndirectos";

        if (year !== null)
            filter.year = year;
        if (month !== null)
            filter.month = month;

        filter.deleted = false;
        
        var costroByDate = [];
        Pago.find(filter)
            .populate('servicios')
            .select({"servicios": 1, "montoE": 2, "montoC": 3})
            .sort('-created')
            .exec(function (err, pagos) {
                
                var costo = [];
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {                    
                    for (var i = pagos.length - 1; i >= 0; i--) {
                        var costroId = pagos[i].servicios.costosindirectos;
                        if (pagos[i].servicios.costcenters[0] == centroId) {                                                                

                            if (costroByDate[costroId])
                                costroByDate[costroId] += pagos[i]['montoE'] + pagos[i]['montoC'];
                            else
                                costroByDate[costroId] = pagos[i]['montoE'] + pagos[i]['montoC'];
                        }
                    }
                   
                    Costosindirecto.find({costcenters: centroId})
                        .sort('-created')
                        .exec(function (err, costoindirecto) {
                            
                            var len = costoindirecto.length - 1;
                            for (var i = 0; i < costoindirecto.length; i++) {
                                if (costroByDate[costoindirecto[i]._id]) {
                                    costoindirecto[i]['total'] = costroByDate[costoindirecto[i]._id];
                                }else{
                                    costoindirecto[i]['total'] = 0;
                                }

                                getFactura(costoindirecto[i],i,len)
                            }
                            //res.jsonp(costoindirecto); 
                        });
                }


                function getFactura(centroInfo,centroIndex,centroLen) {
                  var facturaTotal = 0;
                   Factura.find({title2: centroInfo.name},{total:1},function(err,factura){
                   
                      if(factura.length > 0) {                                
                        for(var j = 0; j < factura.length; j++) {
                          facturaTotal += factura[j].total;
                        }
                      }

                      var resultObj = {
                        _id: centroInfo._id,
                        user: centroInfo.user,
                        enterprise: centroInfo.enterprise,
                        costcenters: centroInfo.costcenters,                        
                        created: centroInfo.created,
                        deleted: centroInfo.deleted,
                        cheques: centroInfo.cheques,
                        efectivo: centroInfo.efectivo,
                        total: centroInfo.total,
                        servicio: centroInfo.servicio,                         
                        name: centroInfo.name,
                        facturado: facturaTotal
                      }

                      costo.push(resultObj);

                      if(centroIndex === centroLen) {
                        sendResult(function(){                               
                          
                          res.jsonp(costo);                                
                        })
                      }
                      
                  })
                }

                function sendResult(cb) {
                  cb();
                }

            });
    }
    else if (centroId !== null) {
/*        Servicio.find({costcenters: centroId})
            .exec(function (err, servicios) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    var costroAmount = [];
                    for (var i = 0; i < servicios.length; i++) {
                        var costroId = servicios[i].costosindirectos;
                        if (costroAmount[costroId])
                            costroAmount[costroId] += servicios[i]['pagoAcumulados'];
                        else
                            costroAmount[costroId] = servicios[i]['pagoAcumulados'];
                    }
                    var costoIds = servicios.map(function (el) {
                        return el.costosindirectos
                    });
                    Costosindirecto.find({_id: {$in: costoIds}})
                        .sort('-created')
                        .exec(function (err, costoindirecto) {
                            for (var i = 0; i < costoindirecto.length; i++) {
                                var costoindirectoId = costoindirecto[i]['_id'];
                                costoindirecto[i]['total'] = costroAmount[costoindirectoId];
                            }
                            res.jsonp(costoindirecto);
                        });
                }
            })
*/    
                    Costosindirecto.find({costcenters: centroId})
                        .sort('-created')
                        .exec(function (err, costoindirecto) {
                            
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                res.jsonp(costoindirecto);
                            }
                        });
    }
    else {
        Costosindirecto.find()
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('servicio', 'name descripcion')
            .exec(function (err, costosindirecto) {
                
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(costosindirecto);
                }
            });
    }

};

/**
 * Costosindirecto middleware
 */

exports.costosindirectoByID = function (req, res, next, id) {
    Costosindirecto.findById(id)
        .populate('user', 'displayName')
        .populate('enterprise', 'name')
        // .populate('servicio', 'name descripcion total efectivo cheques credito debito dolares')
        .exec(function (err, costosindirecto) {
           
            if (err) return next(err);
            if (!costosindirecto) return next(new Error('Failed to load sucursal ' + id));
            req.costosindirecto = costosindirecto;
            next();
        });
};
exports.getCostroByDate