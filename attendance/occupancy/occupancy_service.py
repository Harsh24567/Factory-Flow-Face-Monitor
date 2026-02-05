class OccupancyService:
    def get_current_count(self, persons):
        return sum(1 for p in persons.values() if p.is_inside)

    def get_present_people(self, persons):
        present = []
        for p in persons.values():
            if p.is_inside:
                present.append({
                    "person_id": p.person_id,
                    "since": p.in_time
                })
        return present
