import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';

export const reportController = {
  async createReport(req, res) {
    const reportData = {
      ...req.body,
      reporterId: req.user.uid,
      reporterEmail: req.user.email,
      reporterName: req.user.displayName || `${req.user.firstName} ${req.user.lastName}`,
      status: 'pending',
      createdAt: new Date()
    };
    
    const reportCollection = getCollection('reports');
    
    const existingReport = await reportCollection.findOne({
      bookId: reportData.bookId,
      reporterId: req.user.uid
    });

    if (existingReport) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reported this book' 
      });
    }

    const result = await reportCollection.insertOne(reportData);
    
    if (result.insertedId) {
      res.status(201).json({ 
        success: true, 
        message: 'Report submitted successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to submit report' 
      });
    }
  },

  async checkReport(req, res) {
    const { bookId } = req.params;
    const reportCollection = getCollection('reports');
    
    const report = await reportCollection.findOne({
      bookId,
      reporterId: req.user.uid
    });

    res.json({ 
      reported: !!report,
      report: report || null
    });
  }
};