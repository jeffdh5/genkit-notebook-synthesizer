import { Request, Response, NextFunction } from 'express';
import { synthesize } from '../synthesis';
import { SynthesisRequest } from '../schemas/podcast';
import { db, JOBS_COLLECTION } from '../config';
import { JobStatus } from '../flows';

export const synthesisController = {
  synthesize: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const synthesisRequest: SynthesisRequest = req.body;
      
      // Validate jobId is provided
      if (!synthesisRequest.jobId) {
        throw new Error('jobId is required in the request body');
      }

      // Initialize job status in Firestore
      if (db) {
        await db.collection(JOBS_COLLECTION).doc(synthesisRequest.jobId).set({
          status: JobStatus.QUEUED,
          createdAt: Date.now(),
          request: synthesisRequest
        });
      }

      try {
        // Start synthesis process asynchronously
        const result = await synthesize(synthesisRequest);
        if (db) {
          await db.collection(JOBS_COLLECTION).doc(synthesisRequest.jobId).update({
            status: JobStatus.COMPLETED,
            result,
            completedAt: Date.now()
          });
        }
        // Emit the response of synthesize
        return res.json({ status: 'success', result });
      } catch (error: unknown) {
        if (db) {
          await db.collection(JOBS_COLLECTION).doc(synthesisRequest.jobId).update({
            status: JobStatus.ERROR,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            failedAt: Date.now()
          });
        }
        return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error occurred' });
      }
    } catch (error) {
      next(error);
    }
  },

  getStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;

      if (!db) {
        res.json({ jobId, status: 'pending' });
        return;
      }

      const jobDoc = await db.collection(JOBS_COLLECTION).doc(jobId).get();
      
      if (!jobDoc.exists) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      const jobData = jobDoc.data();
      res.json({
        jobId,
        ...jobData
      });

    } catch (error) {
      next(error);
    }
  }
}; 