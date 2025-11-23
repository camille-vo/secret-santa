const { addGiftee } = require(Runtime.getAssets()['/airtable.js'].path);

const assignGiftees = async (context, records) => {
    // Filter records that have a Name filled in
    const participantsWithName = records.filter(record => record.fields.Name);

    if (participantsWithName.length < 2) {
        console.log('Not enough participants with names to assign giftees');
        return;
    }

    // Create an array of assignees and shuffle them
    let assignees = [...participantsWithName];

    // Shuffle the assignees array using Fisher-Yates algorithm
    for (let i = assignees.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [assignees[i], assignees[j]] = [assignees[j], assignees[i]];
    }

    // Assign each person to a giftee, ensuring no one gets themselves
    for (let i = 0; i < participantsWithName.length; i++) {
        let giftee = assignees[i];

        // If someone gets themselves, swap with the next person
        if (giftee.id === participantsWithName[i].id) {
            if (i < participantsWithName.length - 1) {
                [assignees[i], assignees[i + 1]] = [assignees[i + 1], assignees[i]];
                giftee = assignees[i];
            } else {
                [assignees[i], assignees[i - 1]] = [assignees[i - 1], assignees[i]];
                giftee = assignees[i];
            }
        }

        // Assign the giftee
        await addGiftee(context, participantsWithName[i].id, giftee.id);
    }
}

const validateGiftees = (records) => {
    // Filter records that have a Name filled in
    const participantsWithName = records.filter(record => record.fields.Name);

    const errors = [];
    const seenGiftees = new Set();

    for (const participant of participantsWithName) {
        const gifteeId = participant.fields.Giftee;

        // Check if participant has a giftee assigned
        if (!gifteeId) {
            errors.push(`Participant "${participant.fields.Name}" (ID: ${participant.id}) has no giftee assigned`);
            continue;
        }

        // Check if they are assigned to themselves
        if (gifteeId === participant.id) {
            errors.push(`Participant "${participant.fields.Name}" (ID: ${participant.id}) is assigned to themselves`);
        }

        // Check for duplicate giftee assignments
        if (seenGiftees.has(gifteeId)) {
            errors.push(`Giftee ID ${gifteeId} is assigned to multiple participants`);
        }
        seenGiftees.add(gifteeId);
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

const broadcastMatches = async (context, records, emoji) => {
    const participantsWithName = records.filter(record => record.fields.Name);
    let successCount = 0;
    let failureCount = 0;

    // Send broadcast messages to each participant
    for (const record of participantsWithName) {
        const name = record.get('Name');
        const phoneNumber = record.get('Phone Number');
        const giftee = record.get('Giftee');
        const gifteeRecord = records.find(r => r.id === giftee);
        console.log(context.TWILIO_PHONE_NUMBER)

        if (gifteeRecord && phoneNumber) {
            const gifteeName = gifteeRecord ? gifteeRecord.get('Name') : 'Unknown';
            // const message = `${emoji.get('gift')} ${name}, you'll be buying a gift for ${gifteeName} ${emoji.get('tada')}`;
            const message = `THIS IS JUST A TEST. Match is ${gifteeName}. I REPEAT THIS IS JUST A TEST`

            try {
                await context.getTwilioClient().messages.create({
                    body: message,
                    from: context.TWILIO_PHONE_NUMBER,
                    to: phoneNumber
                });
                console.log(`Successfully sent message to ${phoneNumber}`);
                successCount++;
            } catch (err) {
                console.error(`Error sending message to ${phoneNumber}`, err);
                failureCount++;
            }
        }
    }

    return {
        successCount,
        failureCount
    };
}

module.exports = {
    assignGiftees,
    validateGiftees,
    broadcastMatches
};
