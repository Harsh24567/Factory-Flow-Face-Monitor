from sqlalchemy import (
    create_engine, Column, Integer, String,
    Float, DateTime
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "sqlite:///database/face_attendance.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class FaceAttendance(Base):
    __tablename__ = "face_attendance"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(String, index=True)
    in_time = Column(DateTime)
    out_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    date = Column(DateTime, default=datetime.date.today)
    confidence = Column(Float, nullable=True)


class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)


def init_db():
    Base.metadata.create_all(bind=engine)
