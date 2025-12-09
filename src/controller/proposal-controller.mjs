import { HttpStatusCode } from "axios";
import { updateGeneralProposal } from "../utils/modify-general-proposal.mjs";

export const recommendProposalController = (req, res) => {
    const { proposal, job_title, job_description, skills, client_name, bidder_name } = req?.body;

    // 3. Generate proposal
    const finalProposal = updateGeneralProposal(client_name, skills, job_title, job_description, proposal, bidder_name);

    res.status(HttpStatusCode.Ok).send({
        status: HttpStatusCode.Ok,
        message: "Proposal Generated",
        data: {
            proposal: finalProposal
        }
    });
}