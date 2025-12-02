import { HttpStatusCode } from "axios";
import { filterStrongSkills, generateProposal, scoreSkills } from "../services/skill-service.mjs";
import { updateGeneralProposal } from "../utils/modify-general-proposal.mjs";

export const recommendProposalController = (req, res) => {
    const { proposal, job_title, job_description, skills, client_name, bidder_name } = req?.body;

    // 3. Generate proposal
    const newProposal = proposal?.sort((a, b) => a.order - b.order)?.filter(a => a.alwaysInclude)?.reduce((prev, curr) => prev + curr.content, "");
    const finalProposal = updateGeneralProposal(client_name, skills, job_title, job_description, newProposal, bidder_name);

    res.status(HttpStatusCode.Ok).send({
        status: HttpStatusCode.Ok,
        message: "Proposal Generated",
        data: {
            proposal: finalProposal
        }
    });
}