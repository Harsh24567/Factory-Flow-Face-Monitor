class OccupancyManager:
    """
    Provides real-time occupancy information
    based on current PersonTracker states.
    """

    def get_current_count(self, persons):
        """
        persons : dict[track_id -> PersonTracker]

        Returns total number of people currently inside.
        """
        return sum(
            1 for person in persons.values()
            if person.is_inside
        )

    def get_present_people(self, persons):
        """
        Returns list of dicts describing who is present.
        Includes KNOWN and UNKNOWN.
        """
        present = []

        for person in persons.values():
            if person.is_inside:
                present.append({
                    "person_id": person.person_id,
                    "name": person.name,
                    "since": person.in_time
                })

        return present

    def get_known_present(self, persons):
        """
        Returns only KNOWN workers currently present.
        """
        return [
            person for person in persons.values()
            if person.is_inside and not person.person_id.startswith("UNKNOWN")
        ]

    def get_unknown_present(self, persons):
        """
        Returns UNKNOWN persons currently present.
        """
        return [
            person for person in persons.values()
            if person.is_inside and person.person_id.startswith("UNKNOWN")
        ]
