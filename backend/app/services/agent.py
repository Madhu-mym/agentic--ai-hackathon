from typing import Dict, Any, Optional


class OnboardingAgent:
    def __init__(self, rag_engine=None):
        self.rag_engine = rag_engine

    async def run(
        self,
        user_message: str,
        user_id: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:

        message = user_message.lower()

        if "leave" in message or "policy" in message:
            answer = (
                "Our onboarding policies provide guidelines for employees. "
                "For leave-related questions, please refer to the Leave Policy "
                "available in the Policies section."
            )
            source = "Leave Policy"

        elif "task" in message or "onboarding" in message:
            answer = (
                "Your onboarding includes completing the welcome orientation, "
                "setting up your account, reviewing company policies, meeting "
                "your team, and completing the required onboarding tasks."
            )
            source = "Onboarding Tasks"

        elif "it" in message or "support" in message or "contact" in message:
            answer = (
                "For IT-related issues, you can contact the IT Support team. "
                "You can find their contact details in the Contacts section."
            )
            source = "Contacts"

        elif "hello" in message or "hi" in message:
            answer = (
                "Hello! I'm your AI Onboarding Assistant. "
                "You can ask me about onboarding tasks, company policies, "
                "or who to contact for help."
            )
            source = "Onboarding Assistant"

        else:
            answer = (
                "I can help with onboarding tasks, company policies, "
                "and finding the right contact. Try asking: "
                "\"What are my onboarding tasks?\" or "
                "\"Who should I contact for IT support?\""
            )
            source = "Onboarding Knowledge Base"

        return {
            "answer": answer,
            "sources": [source],
            "session_id": session_id or "demo-session",
        }