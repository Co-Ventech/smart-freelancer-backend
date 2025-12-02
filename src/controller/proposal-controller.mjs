import { HttpStatusCode } from "axios";
import { filterStrongSkills, generateProposal, scoreSkills } from "../services/skill-service.mjs";
import { updateGeneralProposal } from "../utils/modify-general-proposal.mjs";

export const recommendProposalController = (req, res) => {
    const { proposal, job_title, job_description, skills, client_name, bidderName } = req?.body;

    // 3. Generate proposal
    const newProposal= proposal?.sort((a, b) => a - b)?.join('');
    console.log(newProposal);
    const finalProposal = updateGeneralProposal(client_name, skills,job_title, job_description, newProposal, bidderName);

    res.status(HttpStatusCode.Ok).send({
        status: HttpStatusCode.Ok,
        message: "Proposal Generated",
        data: {
            proposal: finalProposal
        }
    });
}