const httpStatus = require('http-status');
const { ScrapJob } = require('../models');
const ApiError = require('../utils/ApiError');


const createScrapJob = async (job) => {
    return await ScrapJob.create(job);
};

const getScrapJobById = async (id) => { 
    return await ScrapJob.findById(id);
}

const updateStatus = async (jobId, status, err=null) => {
    const job = await getScrapJobById(jobId);
    if (!job) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
    }
    Object.assign(job, { status });
    if(err){
        Object.assign(job, { error: err });
    }
    await job.save();
    return job;
};

const queryScrapJobs = async (filter, options) => {
    const jobs = await ScrapJob.paginate(filter, options);
    return jobs;
};

module.exports = {
    createScrapJob,
    queryScrapJobs,
    updateStatus,
};
