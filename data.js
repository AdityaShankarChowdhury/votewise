// data.js
const electionData = {
  india: {
    name: "India 🇮🇳",
    body: "Election Commission of India",
    steps: [
      { id: 1, title: "Model Code of Conduct Announced", phase: "Pre-Election", duration: "~60 days before", citizen: "Stay informed about candidate conduct rules", official: "ECI enforces behavioral rules on parties", icon: "📋" },
      { id: 2, title: "Electoral Roll / Voter List Finalized", phase: "Pre-Election", duration: "45 days before", citizen: "Check names at voters.eci.gov.in", official: "Final electoral roll published and verified", icon: "📜" },
      { id: 3, title: "Candidate Nomination Filing", phase: "Pre-Election", duration: "30-20 days before", citizen: "Research candidates filing from your constituency", official: "Candidates submit papers to Returning Officer", icon: "📝" },
      { id: 4, title: "Scrutiny of Nominations", phase: "Pre-Election", duration: "19 days before", citizen: "Check candidate criminal records on ECI website", official: "RO verifies nomination validity, Form 26 criminal disclosures", icon: "🔍" },
      { id: 5, title: "Withdrawal of Candidature", phase: "Pre-Election", duration: "16 days before", citizen: "Final list of candidates is published", official: "Candidates can withdraw within deadline", icon: "🔙" },
      { id: 6, title: "Campaign Period", phase: "Pre-Election", duration: "14 days before", citizen: "Attend rallies, study manifestos, make informed choice", official: "Rallies, ads, manifestos; ECI monitors spending", icon: "📣" },
      { id: 7, title: "Silent Period", phase: "Pre-Election", duration: "48 hrs before", citizen: "No campaigning, final reflection period", official: "No campaigning allowed", icon: "🔇" },
      { id: 8, title: "Polling Day", phase: "Election Day", duration: "Single day (7AM-6PM)", citizen: "Carry Voter ID, go to booth, press EVM button", official: "7AM-6PM voting, EVMs used, VVPAT slip visible", icon: "🗳️" },
      { id: 9, title: "Vote Counting", phase: "Post-Election", duration: "1-3 days after", citizen: "Watch results on TV/ECI website", official: "EVMs opened under CCTV, counting agents present", icon: "🔢" },
      { id: 10, title: "Result Declaration & Oath Taking", phase: "Post-Election", duration: "Same day / Within weeks", citizen: "Watch swearing-in ceremony", official: "RO declares winner, swearing-in follows", icon: "📊" }
    ]
  },
  usa: {
    name: "USA 🇺🇸",
    body: "Federal Election Commission & State Boards",
    steps: [
      { id: 1, title: "Primary Elections", phase: "Pre-Election", duration: "Jan-Jun", citizen: "Vote for your party's preferred candidate", official: "Parties select their nominees", icon: "🗳️" },
      { id: 2, title: "Voter Registration Deadline", phase: "Pre-Election", duration: "Varies by state", citizen: "Register to vote or update registration", official: "Varies by state, some allow same-day", icon: "📋" },
      { id: 3, title: "Candidate Filing", phase: "Pre-Election", duration: "Months before", citizen: "Learn about the candidates running", official: "FEC registration, campaign finance disclosures", icon: "📝" },
      { id: 4, title: "Campaign Period", phase: "Pre-Election", duration: "Sep-Oct", citizen: "Watch presidential debates, review platforms", official: "TV ads, debates, rallies", icon: "📣" },
      { id: 5, title: "Early Voting Opens", phase: "Pre-Election", duration: "Oct-Nov", citizen: "Vote early if you prefer avoiding lines", official: "In-person early voting begins (varies by state)", icon: "🚶" },
      { id: 6, title: "Mail-in/Absentee Ballots", phase: "Pre-Election", duration: "Sep-Nov", citizen: "Request and return ballots by mail", official: "Citizens can request and return ballots", icon: "✉️" },
      { id: 7, title: "Election Day", phase: "Election Day", duration: "November", citizen: "Go to assigned precinct, cast ballot", official: "First Tuesday after first Monday in November", icon: "🗳️" },
      { id: 8, title: "Ballot Counting", phase: "Post-Election", duration: "Nov", citizen: "Follow state projections", official: "Paper ballots, optical scanners, some EVMs", icon: "🔢" },
      { id: 9, title: "Electoral College Vote", phase: "Post-Election", duration: "December", citizen: "Understand electoral vs popular vote", official: "Electors cast official votes in December", icon: "🏛️" },
      { id: 10, title: "Inauguration", phase: "Post-Election", duration: "Jan 20", citizen: "Watch the new President take the oath", official: "President sworn in on January 20th", icon: "✋" }
    ]
  },
  uk: {
    name: "UK 🇬🇧",
    body: "The Electoral Commission",
    steps: [
      { id: 1, title: "Parliament Dissolved", phase: "Pre-Election", duration: "25 working days before", citizen: "Follow the announcement of the General Election", official: "PM requests dissolution, campaign begins", icon: "👑" },
      { id: 2, title: "Candidate Nomination", phase: "Pre-Election", duration: "25 days before polling", citizen: "See who is standing in your constituency", official: "25 days before polling day", icon: "📝" },
      { id: 3, title: "Voter Registration Deadline", phase: "Pre-Election", duration: "12 working days before", citizen: "Register to vote", official: "12 working days before polling", icon: "📋" },
      { id: 4, title: "Postal Vote Applications", phase: "Pre-Election", duration: "11 working days before", citizen: "Apply for a postal vote if needed", official: "Deadline 11 working days before", icon: "✉️" },
      { id: 5, title: "Campaign Period", phase: "Pre-Election", duration: "Last few weeks", citizen: "Read manifestos, attend hustings", official: "Political parties campaign, spending limits apply", icon: "📣" },
      { id: 6, title: "Polling Day", phase: "Election Day", duration: "Thursday (7AM-10PM)", citizen: "Bring accepted photo ID, vote", official: "7AM to 10PM, paper ballots used", icon: "🗳️" },
      { id: 7, title: "Verification of Ballots", phase: "Post-Election", duration: "Overnight", citizen: "Wait for initial turnout figures", official: "All ballot papers verified for authenticity", icon: "🔍" },
      { id: 8, title: "Counting Night", phase: "Post-Election", duration: "Overnight", citizen: "Watch exit polls and results", official: "Count begins after polls close, results announced", icon: "🔢" },
      { id: 9, title: "Returning Officer Declares Results", phase: "Post-Election", duration: "Friday morning", citizen: "See who won your local MP seat", official: "Winner notified, unseated MPs leave", icon: "📊" },
      { id: 10, title: "King's Speech / First PMQs", phase: "Post-Election", duration: "Following weeks", citizen: "Follow the new government's agenda", official: "New Parliament convened, government formed", icon: "🏛️" }
    ]
  },
  generic: {
    name: "Generic Process 🌐",
    body: "National Election Management Body",
    steps: [
      { id: 1, title: "Election Announcement", phase: "Pre-Election", duration: "Months before", citizen: "Mark the date on your calendar", official: "Authority announces dates and schedule", icon: "📢" },
      { id: 2, title: "Voter Registration", phase: "Pre-Election", duration: "Weeks before", citizen: "Ensure you are registered to vote", official: "Authorities update and publish voter rolls", icon: "📋" },
      { id: 3, title: "Candidate Nomination", phase: "Pre-Election", duration: "Weeks before", citizen: "Learn who is running for office", official: "Candidates file papers and declare intent", icon: "📝" },
      { id: 4, title: "Campaigning", phase: "Pre-Election", duration: "Weeks before", citizen: "Listen to debates and read platforms", official: "Regulate campaign finance and media", icon: "📣" },
      { id: 5, title: "Quiet Period", phase: "Pre-Election", duration: "1-2 days before", citizen: "Reflect on choices without campaign noise", official: "Enforce bans on rallies or advertisements", icon: "🔇" },
      { id: 6, title: "Polling Day", phase: "Election Day", duration: "Designated Day", citizen: "Go to your local polling station and vote", official: "Manage polling stations and ensure security", icon: "🗳️" },
      { id: 7, title: "Ballot Collection", phase: "Post-Election", duration: "Election Night", citizen: "Wait for polls to close", official: "Secure and transport ballot boxes/data", icon: "🔒" },
      { id: 8, title: "Counting", phase: "Post-Election", duration: "Hours/Days after", citizen: "Follow early result projections", official: "Tally votes transparently with observers", icon: "🔢" },
      { id: 9, title: "Official Declaration", phase: "Post-Election", duration: "Days after", citizen: "Acknowledge the official winner", official: "Certify and announce final results", icon: "📊" },
      { id: 10, title: "Transition of Power", phase: "Post-Election", duration: "Weeks after", citizen: "Watch the new government take office", official: "Swear in elected officials", icon: "🏛️" }
    ]
  }
};

const faqData = [
  { question: "Who is eligible to vote in India?", answer: "Any Indian citizen who is 18 years of age or older on January 1st of the year the electoral roll is revised, is a resident of the polling area, and is not disqualified under any law." },
  { question: "What documents do I need at the polling booth in India?", answer: "Your Voter ID card (EPIC) is ideal. However, you can also use alternative photo ID documents like Aadhaar Card, PAN Card, Passport, Driving License, or MGNREGA Job Card, provided your name is on the voter list." },
  { question: "What is NOTA and how do I use it?", answer: "NOTA stands for 'None of the Above'. It allows voters to reject all candidates in their constituency. It is usually the last button on the EVM. Note that NOTA does not impact the election outcome; the candidate with the highest votes still wins." },
  { question: "Can I vote if I moved to a new city?", answer: "You can only vote in the constituency where you are registered. If you moved permanently, you must apply to shift your name to the electoral roll of your new constituency using Form 8 (in India)." },
  { question: "How are votes counted and verified in India?", answer: "Votes are counted under tight security and CCTV surveillance in the presence of candidates' representatives. VVPAT (Voter Verifiable Paper Audit Trail) slips from randomly selected polling stations are also counted to cross-verify EVM results." },
  { question: "What is the Model Code of Conduct?", answer: "A set of guidelines issued by the Election Commission to regulate political parties and candidates prior to elections, ensuring free and fair polling. It prohibits the ruling party from misusing its official position for campaigning." },
  { question: "What happens if my name is missing from the voter list?", answer: "You cannot vote if your name is not on the voter list, even if you have a Voter ID card. Always check your name on the electoral roll a few weeks before the election." },
  { question: "What is an EVM and is it tamper-proof?", answer: "Electronic Voting Machines (EVMs) are standalone machines used to cast votes. They are not connected to the internet, making remote hacking impossible. They undergo rigorous checks, mock polls, and are sealed in the presence of political party representatives." },
  { question: "Can I vote without a Voter ID card?", answer: "Yes, provided your name is in the electoral roll. You can show alternative approved ID proofs like an Aadhaar card, Passport, or Driving License to prove your identity at the polling station." },
  { question: "What is a constituency and how are boundaries decided?", answer: "A constituency is a geographical area that elects one representative to a legislative body. Boundaries are periodically redrawn by a Delimitation Commission to ensure equal population representation." },
  { question: "How are election results declared officially?", answer: "After counting is complete and verified, the Returning Officer of the constituency officially declares the winner and hands them a 'Certificate of Election'." },
  { question: "What is a by-election (by-poll)?", answer: "An election held to fill a political office that has become vacant between general elections, usually due to the death, resignation, or disqualification of the incumbent." }
];

const glossaryData = [
  { term: "Constituency", definition: "A specific geographical area that elects a representative to a legislative body." },
  { term: "Electorate", definition: "All the people in a country or area who are entitled to vote in an election." },
  { term: "Candidate", definition: "A person who applies for a job or is nominated for election." },
  { term: "Returning Officer", definition: "The official in each constituency responsible for the conduct of the election and declaration of the result." },
  { term: "Polling Agent", definition: "A representative appointed by a candidate to be present at a polling station to watch the voting process." },
  { term: "EVM (Electronic Voting Machine)", definition: "Electronic Voting Machine; used to record votes electronically instead of using ballot paper." },
  { term: "VVPAT", definition: "Voter Verifiable Paper Audit Trail; provides feedback to voters using a paper slip to verify their vote was cast correctly." },
  { term: "NOTA", definition: "None of the Above; an option on the ballot that allows voters to disapprove of all candidates." },
  { term: "Voter Roll", definition: "Also known as the Electoral Roll; the official list of all registered voters eligible to vote in an election." },
  { term: "Mandate", definition: "The authority to carry out a policy or course of action, given by the electorate to a candidate or party that wins an election." },
  { term: "Incumbent", definition: "The person currently holding a specific political office." },
  { term: "By-election", definition: "An election held in a single political constituency to fill a vacancy arising during a government's term." },
  { term: "Referendum", definition: "A general vote by the electorate on a single political question which has been referred to them for a direct decision." },
  { term: "Exit Poll", definition: "A poll of voters taken immediately after they have exited the polling stations." },
  { term: "Swing Vote", definition: "A vote that is seen as potentially going to any of a number of candidates in an election, or, in a two-party system, may go to either of the two dominant political parties." },
  { term: "Quorum", definition: "The minimum number of members of an assembly or society that must be present at any of its meetings to make the proceedings of that meeting valid." },
  { term: "Hung Parliament", definition: "A situation in which no particular political party or pre-existing coalition has an absolute majority of legislators in a parliament or other legislature." },
  { term: "Coalition Government", definition: "A government formed by a temporary alliance of political parties when no single party gains a majority." },
  { term: "Booth Capturing", definition: "The illegal practice of taking over a polling station by force to cast false votes." },
  { term: "Model Code of Conduct", definition: "A set of guidelines to regulate political parties and candidates prior to elections, ensuring free and fair polling." }
];